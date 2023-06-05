import { useState } from 'react'
import { AxiosResponse } from 'axios'

import { checkExistingFiles, uploadChunk, uploadComplete } from 'api'
import { MAX_PROGRESS } from 'app-constants'
import { ChunksData } from 'types/hash-worker'
import { asyncPool, calcUploadProgress, getOptimalChunkSize } from 'utils'
import { useForceRerender } from './use-force-rerender'
import { useGenerateFilesHashWorker } from './use-generete-files-hash-worker'

export interface UploadOptions {
	chunkIds: string[]
	fileHash: string
	chunkSize: number
	file: File
	poolLimit?: number
	url: string
	totalSize: number
}

export interface UploadChunkOptions {
	chunk: Blob
	chunkIndex: number
	fileName: string
	url: string
	fileHash: string
	totalSize: number
}

let abortController = new AbortController()

export function useChunkedFilesUpload() {
	const forceRerender = useForceRerender()
	const [uploadProgress, setUploadProgress] = useState<number>(0)
	const [fakeUploadProgress, setFakeUploadProgress] = useState(0)
	const [chunksDataMap] = useState<ChunksData>(new Map())

	const { generateFilesHash, totalHashProgress, resetHash, hashesProgress } =
		useGenerateFilesHashWorker()

	const uploadFiles = async (files: File[]): Promise<string[]> => {
		const filesWithHash = await generateFilesHash({ files })
		const checkExistedFiles = await checkExistingFiles(filesWithHash)
		const existedFilesUrl = checkExistedFiles
			.filter((file) => file.isFileExists)
			.map((file) => file.url)
		const filesToUpload = checkExistedFiles.filter((file) => !file.isFileExists)
		const totalSize = filesToUpload.reduce((size, file) => file.file.size + size, 0)
		const previewUrls: string[] = await Promise.all(
			filesToUpload.map((f) => {
				return uploadChunks({
					url: '/upload',
					file: f.file,
					chunkSize: getOptimalChunkSize(f.file.size),
					poolLimit: 3,
					fileHash: f.hash,
					chunkIds: f.chunkIds,
					totalSize,
				})
					.then(() => uploadComplete({ fileName: f.file.name, fileHash: f.hash }))
					.catch((e) => {
						console.log('UPLOAD FILES ERROR', e)
						const currentProgress = calcUploadProgress(chunksDataMap, totalSize)
						console.log('Previous fake progress:', fakeUploadProgress)
						console.log('Set fake progress to:', currentProgress)
						setFakeUploadProgress(currentProgress)
						return null
					})
			})
		)

		return existedFilesUrl.concat(previewUrls).filter(Boolean)
	}

	const uploadChunks = ({
		chunkIds, // required for resume functionality
		chunkSize,
		file,
		poolLimit = 3,
		url,
		fileHash,
		totalSize,
	}: UploadOptions) => {
		const totalChunksCount = Math.ceil(file.size / chunkSize)

		if (!chunksDataMap.get(file.name)) {
			chunksDataMap.set(file.name, new Map())
		}

		const iterable = Array.from({ length: totalChunksCount }, (_, index) => {
			const chunkData = {
				index,
				chunkId: `${fileHash}-${index}`,
				size: 0,
				progress: 0,
			}

			chunksDataMap.get(file.name).set(index, chunkData)
			return index
		}) // [0, 1, 2,...]

		return asyncPool({
			concurrency: poolLimit,
			iterable,
			iteratorFn: (chunkIndex) => {
				const start = chunkIndex * chunkSize
				const end = chunkIndex + 1 === totalChunksCount ? file.size : chunkSize * (chunkIndex + 1)
				const chunk = file.slice(start, end)

				if (chunkIds.indexOf(chunkIndex + '') !== -1) {
					// Ignore uploaded chunks
					chunksDataMap.get(file.name).set(chunkIndex, {
						index: chunkIndex,
						progress: MAX_PROGRESS,
						size: chunk.size,
						chunkId: `${fileHash}-${chunkIndex}`,
					})
					return Promise.resolve()
				}

				return uploadSingleChunk({
					url,
					chunk,
					chunkIndex,
					fileHash,
					fileName: file.name,
					totalSize,
				})
			},
		})
	}

	const uploadSingleChunk = ({
		chunk,
		chunkIndex,
		fileName,
		url,
		fileHash,
		totalSize,
	}: UploadChunkOptions): Promise<AxiosResponse<void>> => {
		const chunkformData = new FormData()
		chunkformData.set('file', chunk, `${fileHash}-${chunkIndex}`)
		chunkformData.set('fileName', fileName)

		return uploadChunk(url, chunkformData, {
			signal: abortController.signal,
			onUploadProgress(progressEvent) {
				const { loaded, total } = progressEvent
				const progress = (loaded / total) * MAX_PROGRESS

				const chunkData = chunksDataMap.get(fileName).get(chunkIndex)
				chunkData.progress = progress
				chunkData.size = chunk.size

				const uploadProgress = calcUploadProgress(chunksDataMap, totalSize)

				if (uploadProgress >= fakeUploadProgress) {
					setUploadProgress(uploadProgress)
				} else {
					// Required in order to see chunks progress after resume uploading
					forceRerender()
				}
			},
		})
	}

	const resetUploadProgress = () => {
		chunksDataMap.clear()
		setUploadProgress(0)
		setFakeUploadProgress(0)
		resetHash()
	}

	return {
		uploadFiles,
		uploadProgress,
		resetUploadProgress,
		hashesProgress,
		totalHashProgress,
		chunksDataMap,
	}
}
