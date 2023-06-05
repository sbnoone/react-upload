import { AxiosRequestConfig } from 'axios'
import { FileHashes } from 'types/hash-worker'
import { api } from './base'

export const uploadChunk = (url: string, chunkData: FormData, config: AxiosRequestConfig) => {
	return api.post<void>(url, chunkData, {
		...config,
		headers: { 'content-type': 'multipart/form-data' },
	})
}

export const uploadComplete = async ({
	fileName,
	fileHash,
}: {
	fileName: string
	fileHash: string
}): Promise<string> => {
	const {
		data: { url },
	} = await api.get('/upload/done', {
		params: {
			fileName,
			fileHash,
		},
	})

	return url
}

export const checkExistingFiles = async (
	filesWithHash: FileHashes
): Promise<
	{
		file: File
		hash: string
		isFileExists: boolean
		chunkIds: string[]
		url: string | null
	}[]
> => {
	return Promise.all(
		filesWithHash.map(({ file, hash }) =>
			api
				.get<{
					isFileExists: boolean
					chunkIds: string[]
					url: string | null
				}>('/upload/exists', {
					params: {
						fileName: file.name,
						fileHash: hash,
					},
				})
				.then(({ data }) => ({ ...data, file, hash }))
		)
	)
}

export const removeUploadedFiles = async () => {
	try {
		await api.delete('/upload')
	} catch (e) {
		console.log('Delete files error', e)
	}
}
