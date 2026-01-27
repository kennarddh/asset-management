import { DI, Injectable, Service } from '@celosiajs/core'

import { OrderStatus } from '@asset-management/common'

import S3Repository from 'Repositories/S3Repository'

import ConfigurationService from './ConfigurationService/ConfigurationService'
import ImageProcessingService from './ImageProcessingService'

export interface OrderJobData {
	orderId: string
	targetStatus: OrderStatus
}

@Injectable()
class S3Service extends Service {
	constructor(
		private s3Repository = DI.get(S3Repository),
		private configurationService = DI.get(ConfigurationService),
		private imageProcessingService = DI.get(ImageProcessingService),
	) {
		super('S3Service')
	}

	public async uploadUserProfileImage(imageBuffer: Buffer): Promise<string> {
		const optimizedBuffer = await this.imageProcessingService.processImage(
			imageBuffer,
			this.configurationService.configurations.image.userProfileMaxWidth,
		)

		const fileKey = `${crypto.randomUUID()}.webp`

		await this.s3Repository.upload(
			this.configurationService.configurations.s3.buckets.profiles,
			fileKey,
			optimizedBuffer,
			'image/webp',
		)

		return fileKey
	}

	public async deleteUserProfileImage(fileKey: string): Promise<void> {
		await this.s3Repository.delete(
			this.configurationService.configurations.s3.buckets.profiles,
			fileKey,
		)
	}

	public async uploadAssetImage(imageBuffer: Buffer): Promise<string> {
		const optimizedBuffer = await this.imageProcessingService.processImage(
			imageBuffer,
			this.configurationService.configurations.image.assetImageMaxWidth,
		)

		const fileKey = `${crypto.randomUUID()}.webp`

		await this.s3Repository.upload(
			this.configurationService.configurations.s3.buckets.assets,
			fileKey,
			optimizedBuffer,
			'image/webp',
		)

		return fileKey
	}

	public async deleteAssetImage(fileKey: string): Promise<void> {
		await this.s3Repository.delete(
			this.configurationService.configurations.s3.buckets.assets,
			fileKey,
		)
	}

	public getPublicUrl(key: string, type: 'profile' | 'asset'): string {
		const baseUrl = this.configurationService.configurations.imageBaseUrl
		const prefix = type === 'profile' ? '/images/profiles/' : '/images/assets/'

		return `${baseUrl}${prefix}${key}`
	}
}

export default S3Service
