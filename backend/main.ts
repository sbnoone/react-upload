import fastify from 'fastify'
import middie from '@fastify/middie'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fse from 'fs-extra'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import fastifyStatic from '@fastify/static'

import { concatChunksIntoFile } from './utils/concatChunksIntoFile.js'

const PORT = 1234
const UPLOAD_DIR = './uploads/'
const TEMP_DIR = `${UPLOAD_DIR}temp/`
const IGNORED_FILES = ['.DS_Store']

const getDirWithFileChunks = (fileHash: string) => path.join(path.resolve(), TEMP_DIR, fileHash)

const start = async () => {
	const app = fastify({})

	await app.register(fastifyStatic, {
		prefix: '/uploads/',
		root: path.resolve(UPLOAD_DIR),
	})
	await app.register(middie)
	await app.register(cors)
	await app.register(multipart)

	app.route({
		url: '/upload',
		method: 'POST',
		handler: async (req, res) => {
			try {
				const data = req.files()

				for await (const part of data) {
					const [fileHash, chunkIndex] = part.filename.split('-')
					const fileDir = getDirWithFileChunks(fileHash)
					await fse.ensureDir(fileDir)

					const chunkPath = `${fileDir}/${chunkIndex}`
					await pipeline(part.file, fse.createWriteStream(chunkPath)).catch(() => {
						fse.unlink(chunkPath)
						console.log('Upload error for chunk', { chunkIndex })
					})
				}

				res.status(204).send()
			} catch (e) {
				console.log('UPLOAD ERROR:', e)
			}
		},
	})

	app.get<{ Querystring: { fileName: string; fileHash: string } }>(
		'/upload/done',
		async (req, res) => {
			const { fileName, fileHash } = req.query

			await concatChunksIntoFile(
				getDirWithFileChunks(fileHash),
				path.join(path.resolve(), UPLOAD_DIR, fileName)
			)

			res.send({
				status: 'FILE_UPLOADED_SUCCESSFULLY',
				url: `http://localhost:${PORT}/uploads/${fileName}`,
			})
		}
	)

	app.get<{ Querystring: { fileName: string; fileHash: string } }>(
		'/upload/exists',
		async (req, res) => {
			const { fileName, fileHash } = req.query
			const filePath = path.join(UPLOAD_DIR, fileName)
			const isFileExists = await fse.pathExists(filePath)

			if (isFileExists) {
				res.send({
					chunkIds: [],
					isFileExists,
					url: `http://localhost:${PORT}/uploads/${fileName}`,
				})
			} else {
				let chunkIds: string[] = []
				const chunksPath = path.join(TEMP_DIR, fileHash)
				const hasChunksPath = await fse.pathExists(chunksPath)
				if (hasChunksPath) {
					let uploadedChunkIds = await fse.readdir(chunksPath)
					chunkIds = uploadedChunkIds.filter((chunkId) => IGNORED_FILES.indexOf(chunkId) === -1)
				}

				res.send({
					isFileExists,
					chunkIds,
				})
			}
		}
	)

	app.route({
		method: 'DELETE',
		url: '/upload',
		handler(req, res) {
			fse.emptyDirSync(TEMP_DIR)
			fse.emptyDirSync(UPLOAD_DIR)

			res.send('done')
		},
	})

	app.listen({ port: PORT }, (err, address) => {
		if (err) throw err
		console.log('Server is listening on ', address)
	})
}

await start()
