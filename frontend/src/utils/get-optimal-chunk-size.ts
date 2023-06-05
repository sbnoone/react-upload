import { CHUNK_SIZES, HUNDRED_MB, TEN_MB } from 'app-constants'

export function getOptimalChunkSize(fileSize: number): number {
	if (fileSize > HUNDRED_MB) {
		console.log('Chunk size: ', CHUNK_SIZES.BIG)
		return CHUNK_SIZES.BIG
	} else if (fileSize > TEN_MB) {
		console.log('Chunk size: ', CHUNK_SIZES.MEDIUM)
		return CHUNK_SIZES.MEDIUM
	} else {
		console.log('Chunk size: ', CHUNK_SIZES.SMALL)
		return CHUNK_SIZES.SMALL
	}
}
