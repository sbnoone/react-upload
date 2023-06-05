import clsx from 'clsx'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ErrorMessage } from '@hookform/error-message'
import { z } from 'zod'

import { removeUploadedFiles } from 'api'
import { DarkModeToggle } from 'components/dark-mode-toggle/dark-mode-toggle'
import { FilesUploadField } from 'components/form/files-upload-field'
import { ProgressBar } from 'components/progressbar/progressbar'
import { ChunksData } from 'types/hash-worker'
import { useChunkedFilesUpload } from 'hooks/use-chunked-files-upload'

interface FormValues {
	files: File[]
}

const filesSchema = z.object({
	files: z.array(z.instanceof(File)).min(1, 'Files required').default([]),
})

let abortController = new AbortController()

function App() {
	const [uploadedFileUrl, setUploadedFileUrl] = useState<string[]>([])

	const {
		uploadProgress,
		uploadFiles,
		resetUploadProgress,
		hashesProgress,
		totalHashProgress,
		chunksDataMap,
	} = useChunkedFilesUpload()

	const pauseUpload = () => {
		abortController.abort('Pause upload')
		abortController = new AbortController()
	}

	const form = useForm<FormValues>({
		values: {
			files: [],
		},
		resolver: zodResolver(filesSchema),
	})

	const onSubmit: SubmitHandler<FormValues> = async ({ files }) => {
		const urls = await uploadFiles(files)
		setUploadedFileUrl(urls)
	}

	const resetState = () => {
		resetUploadProgress()
		setUploadedFileUrl([])
		form.reset()
	}

	const renderChunksUploadProgress = (chunksDataMap: ChunksData): JSX.Element[] => {
		const jsx: JSX.Element[] = []
		chunksDataMap.forEach((chunksData, fileName) => {
			jsx.push(<p key={fileName}>{fileName}</p>)
			chunksData.forEach((c) => {
				jsx.push(
					<ProgressBar
						label={c.chunkId}
						progress={c.progress}
						key={c.chunkId}
					/>
				)
			})
		})
		return jsx
	}

	const renderHashesProgress = (hashesProgress: Map<string, number>): JSX.Element[] => {
		return Array.from(hashesProgress.entries()).map(([name, progress]) => (
			<ProgressBar
				label={`Hash - ${name}`}
				key={name}
				progress={progress}
			/>
		))
	}

	return (
		<div className='p-2'>
			<form
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-2'
			>
				<FilesUploadField
					name='files'
					control={form.control}
					onChange={() => {
						setUploadedFileUrl([])
					}}
				/>
				<p className='text-red-500'>
					<ErrorMessage
						name='files'
						errors={form.formState.errors}
					/>
				</p>
				<div className='flex gap-2 flex-wrap'>
					<button
						disabled={form.formState.isSubmitting}
						type='submit'
						className={clsx(
							'px-3 py-2 border-2 border-solid rounded-lg [&:not(:disabled)]:hover:bg-gray-100 transition-colors [&:not(:disabled)]:active:bg-gray-200 [&:not(:disabled)]:dark:hover:text-stone-900 [&:not(:disabled)]:dark:active:text-stone-900 disabled:cursor-not-allowed'
						)}
					>
						Upload files
					</button>

					<button
						onClick={pauseUpload}
						type='button'
						className={clsx(
							'px-3 py-2 border-2 border-solid rounded-lg hover:bg-gray-100 transition-colors active:bg-gray-200 dark:hover:text-stone-900 dark:active:text-stone-900'
						)}
					>
						Pause upload
					</button>

					<DarkModeToggle />

					<button
						onClick={removeUploadedFiles}
						type='button'
						className={clsx(
							'px-3 py-2 border-2 border-solid rounded-lg hover:bg-gray-100 transition-colors active:bg-gray-200 dark:hover:text-stone-900 dark:active:text-stone-900'
						)}
					>
						Delete uploads
					</button>
					<button
						onClick={resetState}
						type='button'
						className={clsx(
							'px-3 py-2 border-2 border-solid rounded-lg hover:bg-gray-100 transition-colors active:bg-gray-200 dark:hover:text-stone-900 dark:active:text-stone-900'
						)}
					>
						Reset state
					</button>
				</div>
				{uploadedFileUrl.map((url, i) => (
					<div
						key={i}
						className='p-3 bg-green-600 rounded-lg'
					>
						File uploaded successfully. File preview{' '}
						<a
							className='underline'
							href={url}
							target='_blank'
						>
							link
						</a>
					</div>
				))}
				<ProgressBar
					label='Hash generation progress'
					progress={totalHashProgress}
				/>

				{renderHashesProgress(hashesProgress)}

				<ProgressBar
					label='Upload progress'
					progress={uploadProgress}
				/>

				{renderChunksUploadProgress(chunksDataMap)}
			</form>
		</div>
	)
}

export default App
