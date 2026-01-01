import { CelosiaInstance, DI } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import RedisRepository from 'Repositories/RedisRepository'

import ConfigurationService from 'Services/ConfigurationService/ConfigurationService'
import ScheduleWorkerService from 'Services/ScheduleWorkerService'
import SchedulerService from 'Services/SchedulerService'

Logger.info('Starting server.', {
	pid: process.pid,
})

const configurationService = DI.get(ConfigurationService)

try {
	await configurationService.load()
} catch {
	// No need to handle error here because it is already logged by ConfigurationService.

	process.exit(1)
}

Logger.info('Lazy imports.')

const { default: DatabaseRepository } = await import('Repositories/DatabaseRepository')

let Instance: CelosiaInstance<true>

try {
	const { default: instance } = await import('./App')

	Instance = instance
} catch (error) {
	Logger.error('Failed to load app.', { error })

	process.exit(1)
}

const { default: OnShutdown } = await import('Utils/OnShutdown/OnShutdown')

Logger.info('Lazy imports completed.')

await Promise.all([
	DI.get(DatabaseRepository).connect(),
	DI.get(RedisRepository).connect(),
	DI.get(ScheduleWorkerService).connect(),
	DI.get(SchedulerService).connect(),
])

Logger.info('Setup completed.')

await Instance.listen({
	port: configurationService.configurations.port,
	host: configurationService.configurations.host,
})

Logger.info('Server running.', {
	port: configurationService.configurations.port,
	pid: process.pid,
	env: configurationService.configurations.nodeEnv,
})

// Graceful Shutdown
process.on('SIGTERM', () => void OnShutdown('SIGTERM'))
process.on('SIGINT', () => void OnShutdown('SIGINT'))
