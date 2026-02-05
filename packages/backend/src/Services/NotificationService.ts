import { DI, Injectable, Service } from '@celosiajs/core'

import { NotificationSortField, SortOrder } from '@asset-management/common'

import RemoveKeyFromObjectImmutable from 'Utils/RemoveKeyFromObjectImmutable'

import NotificationRepository, {
	NotificationQueryAllOptions,
} from 'Repositories/NotificationRepository'
import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import { Prisma } from 'PrismaGenerated/client'
import { JsonValue } from 'PrismaGenerated/internal/prismaNamespace'

import ConfigurationService from './ConfigurationService/ConfigurationService'
import { FindManyOptions } from './Types'

export interface Notification {
	id: bigint
	templateKey: string
	payload: JsonValue
	user: { id: bigint; name: string }
	isRead: boolean
	readAt: Date | null
	createdAt: Date
}

export interface NotificationCreateData {
	templateKey: string
	payload: JsonValue
	userId: bigint
}

export interface NotificationFilterOptions {
	userId?: bigint
	isRead?: boolean
}

export interface NotificationFindManyOptions extends FindManyOptions<NotificationSortField> {
	filter?: NotificationFilterOptions
}

export interface NotificationCountOptions {
	filter?: NotificationFilterOptions
}

@Injectable()
class NotificationService extends Service {
	constructor(
		private unitOfWork = DI.get(UnitOfWork),
		private configurationService = DI.get(ConfigurationService),
	) {
		super('NotificationService')
	}

	private transformData(
		data: Prisma.NotificationGetPayload<{ select: NotificationService['dataSelect'] }>,
	): Notification {
		return {
			id: data.id,
			templateKey: data.templateKey,
			payload: data.payload,
			user: { id: data.user.id, name: data.user.name },
			isRead: data.isRead,
			readAt: data.readAt,
			createdAt: data.createdAt,
		}
	}

	private buildRepositoryFilterOptions(filter: NotificationFilterOptions) {
		const repositoryFilter: Prisma.NotificationWhereInput = {}

		if (filter.userId !== undefined) repositoryFilter.userId = filter.userId

		if (filter.isRead !== undefined) repositoryFilter.isRead = filter.isRead

		return repositoryFilter
	}

	private get dataSelect() {
		return {
			id: true,
			templateKey: true,
			payload: true,
			user: { select: { id: true, name: true } },
			isRead: true,
			readAt: true,
			createdAt: true,
		} satisfies Prisma.NotificationSelect
	}

	async findById(id: bigint) {
		return await this.unitOfWork.execute(async transaction => {
			const result = await transaction.getRepository(NotificationRepository).findUnique<{
				user: { id: bigint; name: string }
			}>({
				filter: { id },
				select: this.dataSelect,
			})

			if (result === null) return null

			return this.transformData(result)
		})
	}

	async findMany(options: NotificationFindManyOptions = {}) {
		const repositoryOptions: NotificationQueryAllOptions = {
			select: this.dataSelect,
		}

		if (options.sort !== undefined) {
			repositoryOptions.sort = {
				[options.sort.field]: options.sort.order ?? SortOrder.Ascending,
			}
		}

		if (options.filter !== undefined) {
			repositoryOptions.filter = this.buildRepositoryFilterOptions(options.filter)
		}

		if (options.pagination !== undefined) {
			repositoryOptions.pagination = {
				limit: Math.min(
					options.pagination.limit ??
						this.configurationService.configurations.pagination.defaultLimit,
					this.configurationService.configurations.pagination.defaultMaxLimit,
				),
				page: options.pagination.page ?? 0,
			}
		}

		return await this.unitOfWork.execute(async transaction =>
			transaction.getRepository(NotificationRepository).findMany<{
				user: { id: bigint; name: string }
			}>(repositoryOptions),
		)
	}

	async count(options: NotificationCountOptions): Promise<number> {
		const repositoryOptions: NotificationQueryAllOptions = {}

		if (options.filter !== undefined) {
			repositoryOptions.filter = this.buildRepositoryFilterOptions(options.filter)
		}

		return await this.unitOfWork.execute(async transaction =>
			transaction.getRepository(NotificationRepository).count(repositoryOptions),
		)
	}

	async list(options: NotificationFindManyOptions = {}) {
		return await this.unitOfWork.execute(async () => {
			const result = await this.findMany(options)
			const count = await this.count(options)

			return {
				pagination: {
					page: options.pagination?.page ?? 0,
					limit:
						options.pagination?.limit ??
						this.configurationService.configurations.pagination.defaultLimit,
					total: count,
				},
				list: result.map(asset => ({
					id: asset.id.toString(),
					templateKey: asset.templateKey,
					payload: JSON.stringify(asset.payload),
					user: { id: asset.user.id.toString(), name: asset.user.name },
					isRead: asset.isRead,
					readAt: asset.readAt?.getTime() ?? null,
					createdAt: asset.createdAt.getTime(),
				})),
			}
		})
	}

	async create(data: NotificationCreateData) {
		const newData = RemoveKeyFromObjectImmutable(data, ['payload'])

		return await this.unitOfWork.execute(async transaction => {
			return await transaction.getRepository(NotificationRepository).create({
				data: {
					...newData,
					payload: JSON.stringify(data.payload),
				},
			})
		})
	}
}

export default NotificationService
