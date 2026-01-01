import { DI } from '@celosiajs/core'

import Instance from 'App'

import Logger from 'Utils/Logger/Logger'

import DatabaseRepository from 'Repositories/DatabaseRepository'
import RedisRepository from 'Repositories/RedisRepository'

import ConfigurationService from 'Services/ConfigurationService/ConfigurationService'
import ScheduleWorkerService from 'Services/ScheduleWorkerService'
import SchedulerService from 'Services/SchedulerService'

const OnShutdown = async (signal: string | undefined, exitCode = 0) => {
	const configurationService = DI.get(ConfigurationService)

	Logger.info(signal ? `${signal} signal received: Stopping server.` : 'Stopping server.', {
		port: configurationService.configurations.port,
		pid: process.pid,
		env: configurationService.configurations.nodeEnv,
	})

	if (Instance.isListening) {
		await new Promise(resolve => {
			Instance.close()
				.then(resolve)
				.catch(() => {
					Logger.info('Failed to close Instance.')
				})
		})
	}

	Logger.info('Server closed.', {
		port: configurationService.configurations.port,
		pid: process.pid,
		env: configurationService.configurations.nodeEnv,
	})

	try {
		await DI.get(DatabaseRepository).disconnect()

		Logger.info('Database connection closed.')
	} catch (error) {
		Logger.error('Failed to close database connection.', error)
	}

	try {
		await DI.get(SchedulerService).disconnect()

		Logger.info('SchedulerService disconnected.')
	} catch (error) {
		Logger.error('Failed to disconnect SchedulerService.', error)
	}

	try {
		await DI.get(ScheduleWorkerService).disconnect()

		Logger.info('ScheduleWorkerService disconnected.')
	} catch (error) {
		Logger.error('Failed to disconnect ScheduleWorkerService.', error)
	}

	try {
		await DI.get(RedisRepository).disconnect()

		Logger.info('Redis connection closed.')
	} catch (error) {
		Logger.error('Failed to close Redis connection.', error)
	}

	Logger.info('Exiting.')

	process.exit(exitCode)
}

export default OnShutdown
