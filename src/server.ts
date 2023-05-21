import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { resolve } from 'node:path'

import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { uploadRoutes } from './routes/upload'

const app = fastify()

// it allows api to receive multipart/form-data ex.: file uploads
app.register(multipart)

// it enables static folders to be public and accessible
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: 'spacetime',
})

app.register(authRoutes)
app.register(memoriesRoutes)
app.register(uploadRoutes)

app
  .listen({
    port: 3333,
    // it is needed to allow apps to connect to this server
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('🚀 http server running on http://localhost:3333')
  })
