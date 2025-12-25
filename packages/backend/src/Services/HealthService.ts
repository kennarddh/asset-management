import { DI, Injectable, Service } from '@celosiajs/core'

import DatabaseRepository from 'Repositories/DatabaseRepository'
import RedisRepository from 'Repositories/RedisRepository'

import ConfigurationService from './ConfigurationService/ConfigurationService'

@Injectable()
class HealthService extends Service {
	constructor(
		private configurationService = DI.get(ConfigurationService),
		private databaseRepository = DI.get(DatabaseRepository),
		private redisRepository = DI.get(RedisRepository),
	) {
		super('HealthService')
	}

	async isHealthy() {
		if (!this.configurationService.loaded) return false

		const isDatabaseReady = await this.databaseRepository.isReady()
		const isRedisReady = await this.redisRepository.isReady()

		if (!isRedisReady) return false
		if (!isDatabaseReady) return false

		return true
	}
}

export default HealthService
