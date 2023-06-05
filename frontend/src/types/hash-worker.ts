export type ResultHashWorkerMessageEvent = MessageEvent<{
	hashProgress: number
	fileHashes?: FileHashes
	fileId?: string
}>

export type HashWorkerMessageData = {
	files: File[]
}

export type CalcFileHashOptions = {
	file: File
	chunkSize: number
	postMessage: Window['postMessage']
}

export type CalcFileHashMessageData = {
	hashProgress: number
	fileId: string
}

export type FileHashes = { file: File; hash: string }[]

export interface ChunkData {
	index: number
	size: number
	progress: number
	chunkId: string
}

export type ChunksData = Map<string, Map<number, ChunkData>>
