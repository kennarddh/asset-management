import { Injectable, Service } from '@celosiajs/core'

import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'

import { ProcessingError } from 'Errors'

@Injectable()
class ImageProcessingService extends Service {
	constructor() {
		super('ImageProcessingService')
	}

	public async processImage(inputBuffer: Buffer, maxWidth = 1920): Promise<Buffer> {
		try {
			return await sharp(inputBuffer)
				.rotate() // Auto-rotate based on EXIF
				.resize({
					width: maxWidth,
					withoutEnlargement: true, // Don't upscale small images
					fit: 'inside', // Maintain aspect ratio
				})
				.webp({ quality: 80 }) // Convert to WebP (80% quality)
				.toBuffer()
		} catch (error) {
			this.logger.error('Failed to process user profile image.', error)

			throw new ProcessingError()
		}
	}

	public async isValidImage(buffer: Buffer) {
		const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

		const fileType = await fileTypeFromBuffer(buffer)

		if (fileType === undefined) return false

		return allowedMimes.includes(fileType.mime)
	}
}

export default ImageProcessingService
