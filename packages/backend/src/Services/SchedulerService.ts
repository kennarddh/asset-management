import { DI, DependencyScope, Injectable, Service } from '@celosiajs/core'

import { OrderStatus } from '@asset-management/common'
import { Queue } from 'bullmq'

import RedisRepository from 'Repositories/RedisRepository'

export interface OrderJobData {
	orderId: string
	targetStatus: OrderStatus
}

@Injectable(DependencyScope.Singleton)
class SchedulerService extends Service {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private queue: Queue<any, any, string, OrderJobData>

	constructor(private redisRepository = DI.get(RedisRepository)) {
		super('SchedulerService')

		this.queue = new Queue('order-jobs', {
			connection: this.redisRepository.redis,
			defaultJobOptions: {
				removeOnComplete: { count: 1000 },
				removeOnFail: { count: 5000 },
				attempts: 5,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
			},
		})

		this.queue.on('error', error => {
			this.logger.error('Queue error.', error)
		})

		this.queue.on('waiting', job => {
			this.logger.info(`Job ${job.id} is waiting to be processed.`)
		})

		this.queue.on('cleaned', () => {
			this.logger.info('Old jobs have been cleaned from the queue.')
		})

		this.queue.on('progress', jobId => {
			this.logger.info(`Job ${jobId} has made progress.`)
		})

		this.queue.on('removed', jobId => {
			this.logger.info(`Job ${jobId} has been removed from the queue.`)
		})

		this.queue.on('resumed', () => {
			this.logger.info('Queue has been resumed.')
		})
	}

	async connect() {
		this.logger.info('Connecting queue.')

		await this.queue.waitUntilReady()

		this.logger.info('Queue connected and ready.')
	}

	async disconnect() {
		this.logger.info('Disconnecting queue.')

		await this.queue.close()

		this.logger.info('Queue disconnected.')
	}

	addJob(name: string, data: OrderJobData, delayMs: number) {
		return this.queue.add(name, data, {
			delay: delayMs,
		})
	}
}

export default SchedulerService
