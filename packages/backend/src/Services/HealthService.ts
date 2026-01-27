import { DI, Injectable, Service } from '@celosiajs/core'

import DatabaseRepository from 'Repositories/DatabaseRepository'
import RedisRepository from 'Repositories/RedisRepository'
import S3Repository from 'Repositories/S3Repository'

import ConfigurationService from './ConfigurationService/ConfigurationService'

@Injectable()
class HealthService extends Service {
	constructor(
		private configurationService = DI.get(ConfigurationService),
		private databaseRepository = DI.get(DatabaseRepository),
		private redisRepository = DI.get(RedisRepository),
		private s3Repository = DI.get(S3Repository),
	) {
		super('HealthService')
	}

	async isHealthy() {
		if (!this.configurationService.loaded) return false

		const isDatabaseReady = await this.databaseRepository.isReady()
		const isRedisReady = await this.redisRepository.isReady()
		const isS3Ready = await this.s3Repository.isReady()

		if (!isRedisReady) return false
		if (!isDatabaseReady) return false
		if (!isS3Ready) return false

		return true
	}
}

export default HealthService
