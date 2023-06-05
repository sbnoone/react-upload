import { calcFileHash } from 'utils/calc-file-hash'
import { FileHashes, HashWorkerMessageData } from 'types/hash-worker'
import { MAX_PROGRESS } from 'app-constants'
import { getOptimalChunkSize } from 'utils/get-optimal-chunk-size'

self.onmessage = async (e: MessageEvent<HashWorkerMessageData>) => {
	const { files } = e.data

	const fileHashes: FileHashes = await Promise.all(
		files.map((file) =>
			calcFileHash({
				file,
				chunkSize: getOptimalChunkSize(file.size),
				postMessage: self.postMessage,
			})
		)
	)

	self.postMessage({
		fileHashes,
		hashPercentage: MAX_PROGRESS,
	})
}
