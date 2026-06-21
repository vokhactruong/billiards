import 'dotenv/config'
// BigInt cannot be serialized by JSON.stringify — convert to string before sending
;(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString()
}
import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import { initSocketIO } from './socket'
import routes from './routes'
import { errorHandler, notFound } from './middlewares/error.middleware'

const app = express()
const httpServer = createServer(app)

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

initSocketIO(httpServer)

app.use('/api', routes)

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use(notFound)
app.use(errorHandler)

const PORT = parseInt(process.env.PORT || '3000', 10)

httpServer.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`)
})

export default app
