import { Response } from 'express'
import { AuthRequest } from '../types'
import cloudinary from '../utils/cloudinary'
import { sendSuccess, sendError } from '../utils/response'

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file provided', 400)
      return
    }

    const url = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'billiards/products', resource_type: 'image' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error)
            return reject(new Error(error.message ?? 'Cloudinary upload failed'))
          }
          if (!result) return reject(new Error('No result from Cloudinary'))
          resolve(result.secure_url)
        }
      )
      stream.end(req.file!.buffer)
    })

    sendSuccess(res, { url }, 'Image uploaded')
  } catch (err) {
    console.error('Upload error:', err)
    const message = err instanceof Error ? err.message : String(err)
    sendError(res, message, 500)
  }
}
