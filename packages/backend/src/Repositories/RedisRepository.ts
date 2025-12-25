import { DI, DependencyScope, Injectable, Repository } from '@celosiajs/core'

import Redis from 'ioredis'

import ConfigurationService from 'Services/ConfigurationService/ConfigurationService'

@Injectable(DependencyScope.Singleton)
class RedisRepository extends Repository {
	private _redis: Redis

	constructor(configurationService = DI.get(ConfigurationService)) {
		super('RedisRepository')

		this._redis = new Redis({
			host: configurationService.configurations.redis.host,
			port: configurationService.configurations.redis.port,
			username: configurationService.configurations.redis.username,
			password: configurationService.configurations.redis.password,
			db: configurationService.configurations.redis.db,
			lazyConnect: true,
		})

		this._redis.on('error', error => {
			this.logger.error('Error.', error)
		})

		this._redis.on('connect', () => {
			this.logger.info('Connected.')
		})

		this._redis.on('ready', () => {
			this.logger.info('Ready.')
		})

		this._redis.on('close', () => {
			this.logger.info('Connection closed.')
		})

		this._redis.on('reconnecting', (time: number) => {
			this.logger.warn(`Reconnecting in ${time}ms.`)
		})

		this._redis.on('end', () => {
			this.logger.info('Connection ended.')
		})

		this._redis.on('warning', (warning: string) => {
			this.logger.warn(`Redis warning: ${warning}`)
		})
	}

	async connect() {
		this.logger.info('Init.')

		try {
			await this.redis.connect()

			const isReady = await this.isReady()

			if (!isReady) {
				throw new Error('Redis is not ready')
			}

			this.logger.info('Connected.')
		} catch (error) {
			this.logger.error('Failed to connect.', error)

			const { default: OnShutdown } = await import('Utils/OnShutdown/OnShutdown')

			await OnShutdown(undefined, 1)
		}
	}

	async disconnect() {
		this.logger.info('Disconnecting.')

		this.redis.disconnect()

		this.logger.info('Disconnected.')
	}

	get redis() {
		return this._redis
	}

	public async isReady() {
		return this.redis.status === 'ready'
	}
}

export default RedisRepository
