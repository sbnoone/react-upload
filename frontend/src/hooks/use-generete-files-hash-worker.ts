import { useEffect, useRef, useState } from 'react'
import { FileHashes, HashWorkerMessageData, ResultHashWorkerMessageEvent } from 'types/hash-worker'

type FileId = string
type FileSize = number

export const useGenerateFilesHashWorker = () => {
	const [totalHashProgress, setTotalHashProgress] = useState<number>(0)
	const [hashesProgress] = useState(new Map<FileId, FileSize>())

	const workerRef = useRef<Worker | null>(null)

	const generateFilesHash = (messageData: HashWorkerMessageData): Promise<FileHashes> => {
		const newWorker = new Worker(new URL('../workers/generate-file-hash.ts', import.meta.url), {
			type: 'module',
		})

		newWorker.postMessage(messageData)
		workerRef.current = newWorker

		return new Promise((resolve) => {
			newWorker.onmessage = (event: ResultHashWorkerMessageEvent) => {
				const { hashProgress, fileHashes, fileId } = event.data

				if (fileId) {
					hashesProgress.set(fileId, hashProgress)
				}

				let totalHashProggress = 0
				hashesProgress.forEach((progress) => {
					totalHashProggress += progress
				})

				setTotalHashProgress(totalHashProggress / hashesProgress.size)
				if (fileHashes) {
					resolve(fileHashes)
					console.log('Termitanate generate hash Webworker')
					workerRef.current.terminate()
				}
			}
		})
	}

	const resetHash = () => {
		setTotalHashProgress(0)
		hashesProgress.clear()
	}

	useEffect(
		() => () => {
			const worker = workerRef.current
			if (worker) worker.terminate()
			console.log('useGenerateFileHashWorker UNMOUNT')
		},
		[]
	)

	return { generateFilesHash, totalHashProgress, resetHash, hashesProgress }
}
