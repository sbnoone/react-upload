import clsx from 'clsx'
import { ClipboardEventHandler } from 'react'
import { useDropzone, DropzoneProps, DropzoneOptions, ErrorCode } from 'react-dropzone'
import { formatBytes } from '../../utils/format-bytes'
import { FilesUploadDropzoneProps } from './files-upload-dropzone.types'

const FILE_SIZE_IN_BYTES = 10485760 // 10 Mb

export const FilesUploadDropzone = ({ onChange, files = [] }: FilesUploadDropzoneProps) => {
	const onDrop: DropzoneProps['onDrop'] = (acceptedFiles, rejectedFiles, event) => {
		onChange?.(acceptedFiles)
	}

	const {
		getInputProps,
		getRootProps,
		acceptedFiles,
		isFocused,
		isDragAccept,
		isDragReject,
		fileRejections,
		isDragActive,
		open: openFileSelect,
		isFileDialogActive,
		inputRef,
		rootRef,
	} = useDropzone({
		onDrop,
		noClick: true,
		multiple: true,
		maxFiles: 5,
		accept: {},
		// maxSize: FILE_SIZE_IN_BYTES,
		// validator: nameLengthValidator,
	})

	const onPaste: ClipboardEventHandler<HTMLDivElement> = async (e) => {
		e.preventDefault()
		const files: File[] = []

		for (let item of e.clipboardData.items) {
			const file: File | null = item.getAsFile()
			if (file) {
				files.push(file)
			}
		}
		onChange?.(files)
	}

	const selectedFilesPreview: JSX.Element[] = files.map((file, i) => {
		return <li key={i}>{`${file.name} - ${formatBytes(file.size)}`}</li>
	})

	const fileErrors = fileRejections.map(({ errors, file }) => (
		<li key={file.name}>
			<p>{file.name}</p>
			<ul>
				{errors.map((error, i) => (
					<li
						key={i}
						className='text-red-500'
					>
						{error.message.replace(`${FILE_SIZE_IN_BYTES} bytes`, formatBytes(FILE_SIZE_IN_BYTES))}
					</li>
				))}
			</ul>
		</li>
	))

	return (
		<>
			<div
				onPaste={onPaste}
				data-formcontrol
				{...getRootProps()}
				className={clsx('border-2 border-gray-300 border-dashed p-5 transition-colors', {
					['border-red-500']: isDragReject,
					['border-green-500']: isDragAccept,
					['border-blue-500']: isDragActive,
				})}
			>
				<p className='text-center'>
					Paste, Drop or{' '}
					<button
						type='button'
						onClick={openFileSelect}
						className='underline'
					>
						click here
					</button>{' '}
					to select files
				</p>
				<div>
					<input
						{...getInputProps()}
						name='files'
						id='files'
					/>
				</div>
			</div>
			{selectedFilesPreview.length > 0 && <ul data-selected-files>{selectedFilesPreview}</ul>}
			{fileRejections.length > 0 && <ul data-file-errors>{fileErrors}</ul>}
		</>
	)
}

const nameLengthValidator: DropzoneOptions['validator'] = (file) => {
	const maxLength = 100
	if (file.name.length > maxLength) {
		return {
			code: 'name-too-large',
			message: `Name is larger than ${maxLength} characters`,
		}
	}

	return null
}
