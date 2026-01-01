import { DI, DependencyScope, Injectable, Service } from '@celosiajs/core'

import { Job, Worker } from 'bullmq'

import RedisRepository from 'Repositories/RedisRepository'

import OrderService from './OrderService'
import { OrderJobData } from './SchedulerService'

@Injectable(DependencyScope.Singleton)
class ScheduleWorkerService extends Service {
	private worker: Worker

	constructor(
		private redisRepository = DI.get(RedisRepository),
		private orderService = DI.get(OrderService),
	) {
		super('ScheduleWorkerService')

		this.worker = new Worker('order-jobs', this.processJob.bind(this), {
			connection: this.redisRepository.redis,
		})

		this.worker.on('error', error => {
			this.logger.error('Worker error.', error)
		})

		this.worker.on('completed', job => {
			this.logger.info(`Job ${job.id} has been completed.`)
		})

		this.worker.on('failed', (job, error) => {
			this.logger.error(`Job ${job?.id} with name ${job?.name} has failed`, error)
		})

		this.worker.on('closing', () => {
			this.logger.info('Worker is closing.')
		})

		this.worker.on('stalled', jobId => {
			this.logger.warn(`Job ${jobId} has stalled and will be reprocessed.`)
		})

		this.worker.on('drained', () => {
			this.logger.debug('All jobs have been processed, worker is drained.')
		})

		this.worker.on('paused', () => {
			this.logger.info('Worker has been paused.')
		})

		this.worker.on('resumed', () => {
			this.logger.info('Worker has been resumed.')
		})

		this.worker.on('active', job => {
			this.logger.debug(`Job ${job.id} is now active.`)
		})
	}

	async connect() {
		this.logger.info('Connecting worker.')

		await this.worker.waitUntilReady()

		this.logger.info('Worker connected and ready.')
	}

	async disconnect() {
		this.logger.info('Disconnecting worker.')

		await this.worker.close()

		this.logger.info('Worker disconnected.')
	}

	async processJob(job: Job<OrderJobData>) {
		this.logger.info(
			`Processing job ${job.id} for order ${job.data.orderId} to status ${job.data.targetStatus}`,
		)

		try {
			await this.orderService.processScheduledJob(job.name, job.data)

			this.logger.info(
				`Successfully updated order ${job.data.orderId} to status ${job.data.targetStatus}`,
			)
		} catch (error) {
			this.logger.error(
				`Failed to process job ${job.id} for order ${job.data.orderId}: ${(error as Error).message}`,
			)

			throw error
		}
	}
}

export default ScheduleWorkerService
