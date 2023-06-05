import fse from 'fs-extra'
import path from 'node:path'

const IGNORES = ['.DS_Store']

export async function concatChunksIntoFile(sourceDir: string, targetPath: string) {
	const readFile = (filePath: string, writeStream: fse.WriteStream): Promise<void> =>
		new Promise((resolve, reject) => {
			fse
				.createReadStream(filePath)
				.on('data', (data) => writeStream.write(data))
				.on('end', resolve)
				.on('error', reject)
		})
	const files: string[] = await fse.readdir(sourceDir)
	const sortedFiles: string[] = files
		.filter((file: string) => IGNORES.indexOf(file) === -1)
		.sort((a: string, b: string) => +a - +b)

	const writeStream = fse.createWriteStream(targetPath)

	for (const file of sortedFiles) {
		const filePath = path.join(sourceDir, file)
		await readFile(filePath, writeStream)
		await fse.unlink(filePath) // Remove processed chunks
	}
	writeStream.end()
	fse.removeSync(sourceDir)
}
