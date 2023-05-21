import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 5_242_880, // 5mb
      },
    })

    if (!upload) {
      return reply.status(400).send()
    }

    // mimetype is a global categorization for files type
    const mimetypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimetypeRegex.test(upload.mimetype)

    if (!isValidFileFormat) {
      return reply.status(400).send()
    }

    const filedId = randomUUID()
    const extension = extname(upload.filename)

    const filename = filedId.concat(extension)

    // createWriteStream to save the file in streaming style
    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads', filename),
    )

    // pump awaits for the streaming process to finish
    await pump(filename, writeStream)

    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    const fileUrl = new URL(`/uploads/${filename}`, fullUrl).toString()

    return { fileUrl }
  })
}
