import throttle from 'lodash.throttle'
import SparkMD5 from 'spark-md5'

import { MAX_PROGRESS, UPDATE_HASH_PROGRESS_THROTTLE_TIME_MS } from 'app-constants'
import { CalcFileHashMessageData, CalcFileHashOptions, FileHashes } from 'types/hash-worker'

export const calcFileHash = ({
	file,
	chunkSize,
	postMessage,
}: CalcFileHashOptions): Promise<FileHashes[number]> =>
	new Promise((resolve, reject) => {
		const totalChunks = Math.ceil(file.size / chunkSize)
		const sparkBuffer = new SparkMD5.ArrayBuffer()
		const fileReader = new FileReader()
		let processedChunks: number = 0
		let hashProgress: number = 0

		const updateProgress = throttle(postMessage, UPDATE_HASH_PROGRESS_THROTTLE_TIME_MS, {
			trailing: true,
			leading: true,
		})

		fileReader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target) {
				sparkBuffer.append(e.target.result as ArrayBuffer) // Append array buffer
				processedChunks++
			}

			hashProgress += MAX_PROGRESS / totalChunks

			const calcFileHashProgressMessage: CalcFileHashMessageData = {
				hashProgress,
				fileId: file.name,
			}

			updateProgress(calcFileHashProgressMessage)

			if (processedChunks < totalChunks) {
				loadNextChunk()
			} else {
				const hash = sparkBuffer.end()
				updateProgress.flush()
				resolve({ file, hash })
			}
		}

		fileReader.onerror = () => {
			fileReader.abort()
			reject(fileReader.error)
		}

		function loadNextChunk() {
			const start = processedChunks * chunkSize
			const end = start + chunkSize >= file.size ? file.size : start + chunkSize

			fileReader.readAsArrayBuffer(file.slice(start, end))
		}

		loadNextChunk()
	})
