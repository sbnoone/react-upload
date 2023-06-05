import { ChunksData } from 'types/hash-worker'

export function calcUploadProgress(chunksDataMap: ChunksData, fileSize: number): number {
	let bytesUploaded = 0
	chunksDataMap.forEach((chunkData) => {
		chunkData.forEach((chunk) => {
			bytesUploaded += chunk.size * chunk.progress
		})
	})
	return bytesUploaded / fileSize
}
