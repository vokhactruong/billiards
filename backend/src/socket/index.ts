import { Server as SocketIOServer } from 'socket.io'
import { Server as HttpServer } from 'http'

let io: SocketIOServer

export const initSocketIO = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`)
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getSocketIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.IO not initialized')
  return io
}
