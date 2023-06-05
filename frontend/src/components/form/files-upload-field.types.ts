import { FieldValues, FieldPathValue, RegisterOptions, Control, Path } from 'react-hook-form'

import { OverrideProps } from 'types/utils'
import { FilesUploadDropzoneProps } from '../files-upload-dropzone/files-upload-dropzone.types'

interface FormInputControllerProps<TFieldsValues extends FieldValues> {
	name: Path<TFieldsValues>
	defaultValue?: FieldPathValue<FieldValues, Path<TFieldsValues>>
	rules?: RegisterOptions
	control: Control<TFieldsValues>
}

export type FilesUploadFieldProps<TFieldsValues extends FieldValues> = OverrideProps<
	FilesUploadDropzoneProps,
	FormInputControllerProps<TFieldsValues>
>
