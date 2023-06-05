import { FieldValues, useController } from 'react-hook-form'
import { FilesUploadDropzone } from '../files-upload-dropzone/files-upload-dropzone'
import { FilesUploadFieldProps } from './files-upload-field.types'

export const FilesUploadField = <FieldsType extends FieldValues>({
	name,
	control,
	rules,
	defaultValue,
	onChange,
}: FilesUploadFieldProps<FieldsType>) => {
	const {
		field: { onChange: onChangeController, value },
	} = useController<FieldsType>({ control, name, defaultValue, rules })

	return (
		<FilesUploadDropzone
			files={value}
			onChange={(e) => {
				onChange?.(e)
				onChangeController(e)
			}}
		/>
	)
}
