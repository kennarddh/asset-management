import { DI, DependencyScope, Injectable, Repository } from '@celosiajs/core'

import {
	DeleteObjectCommand,
	GetObjectCommand,
	ListBucketsCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'

import ConfigurationService from 'Services/ConfigurationService/ConfigurationService'

import { DataAccessError } from 'Errors'

@Injectable(DependencyScope.Singleton)
class S3Repository extends Repository {
	private _s3: S3Client

	constructor(configurationService = DI.get(ConfigurationService)) {
		super('S3Repository')

		this._s3 = new S3Client({
			endpoint: configurationService.configurations.s3.endpoint,
			region: configurationService.configurations.s3.region,
			credentials: {
				accessKeyId: configurationService.configurations.s3.accessKey,
				secretAccessKey: configurationService.configurations.s3.secretKey,
			},
			forcePathStyle: true,
		})

		this.logger.info('Initialized.')
	}

	get s3() {
		return this._s3
	}

	public async isReady() {
		try {
			await this._s3.send(new ListBucketsCommand({}))

			return true
		} catch (error) {
			this.logger.error('Ready check failed.', error)

			return false
		}
	}

	public async upload(
		bucketName: string,
		fileKey: string,
		buffer: Buffer,
		mimeType: string,
	): Promise<void> {
		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: fileKey,
			Body: buffer,
			ContentType: mimeType,
		})

		try {
			await this._s3.send(command)
		} catch (error) {
			this.logger.error(`Failed to upload ${fileKey} to ${bucketName}.`, error)

			throw new DataAccessError()
		}
	}

	public async delete(bucketName: string, fileKey: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: bucketName,
			Key: fileKey,
		})

		try {
			await this._s3.send(command)
		} catch (error) {
			this.logger.error(`Failed to delete ${fileKey} from ${bucketName}.`, error)

			throw new DataAccessError()
		}
	}

	public async getStream(bucketName: string, fileKey: string): Promise<Readable> {
		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: fileKey,
		})

		try {
			const response = await this._s3.send(command)

			return response.Body as Readable
		} catch (error) {
			this.logger.error(`Failed to get ${fileKey} from ${bucketName}.`, error)

			throw new DataAccessError()
		}
	}
}

export default S3Repository
