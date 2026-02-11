import { DI, Injectable, JSON, Service } from '@celosiajs/core'

import {
	NotificationSortField,
	NotificationTemplateKey,
	NotificationTemplatePayload,
	SortOrder,
	UserRole,
} from '@asset-management/common'

import RemoveKeyFromObjectImmutable from 'Utils/RemoveKeyFromObjectImmutable'

import NotificationRepository, {
	NotificationQueryAllOptions,
} from 'Repositories/NotificationRepository'
import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import { Prisma } from 'PrismaGenerated/client'
import { JsonValue } from 'PrismaGenerated/internal/prismaNamespace'

import ConfigurationService from './ConfigurationService/ConfigurationService'
import { FindManyOptions } from './Types'

export interface NotificationForUser {
	id: bigint
	templateKey: string
	payload: JsonValue
	user: { id: bigint; name: string }
	targetRole: null
	clearedBy: { id: bigint; name: string } | null
	isRead: boolean
	readAt: Date | null
	createdAt: Date
}

export interface NotificationForRole {
	id: bigint
	templateKey: string
	payload: JsonValue
	user: null
	targetRole: UserRole
	clearedBy: { id: bigint; name: string } | null
	isRead: boolean
	readAt: Date | null
	createdAt: Date
}

export type Notification = NotificationForUser | NotificationForRole

export interface NotificationCreateDataForUser<T extends NotificationTemplateKey> {
	templateKey: T
	payload: NotificationTemplatePayload[T]
	userId: bigint
	targetRole?: never
}

export interface NotificationCreateDataForRole<T extends NotificationTemplateKey> {
	templateKey: T
	payload: NotificationTemplatePayload[T]
	userId?: never
	targetRole: UserRole
}

export type NotificationCreateData<T extends NotificationTemplateKey> =
	| NotificationCreateDataForUser<T>
	| NotificationCreateDataForRole<T>

export interface NotificationFilterOptions {
	userId?: bigint
	targetRole?: UserRole
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
		const common = {
			id: data.id,
			templateKey: data.templateKey,
			payload: data.payload,
			isRead: data.isRead,
			readAt: data.readAt,
			createdAt: data.createdAt,
			clearedBy: data.clearedBy ? { id: data.clearedBy.id, name: data.clearedBy.name } : null,
		}

		if (data.user !== null) {
			return {
				...common,
				user: { id: data.user.id, name: data.user.name },
				targetRole: null,
			} as NotificationForUser
		} else {
			return {
				...common,
				targetRole: data.targetRole as UserRole,
				user: null,
			} as NotificationForRole
		}
	}

	private buildRepositoryFilterOptions(filter: NotificationFilterOptions) {
		const repositoryFilter: Prisma.NotificationWhereInput = {}

		if (filter.userId !== undefined) repositoryFilter.userId = filter.userId

		if (filter.isRead !== undefined) repositoryFilter.isRead = filter.isRead

		if (filter.targetRole !== undefined) repositoryFilter.targetRole = filter.targetRole

		return repositoryFilter
	}

	private get dataSelect() {
		return {
			id: true,
			templateKey: true,
			payload: true,
			user: { select: { id: true, name: true } },
			targetRole: true,
			clearedBy: { select: { id: true, name: true } },
			isRead: true,
			readAt: true,
			createdAt: true,
		} satisfies Prisma.NotificationSelect
	}

	async findById(id: bigint) {
		return await this.unitOfWork.execute(async transaction => {
			const result = await transaction.getRepository(NotificationRepository).findUnique<{
				user: { id: bigint; name: string } | null
				clearedBy: { id: bigint; name: string } | null
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
				user: { id: bigint; name: string } | null
				clearedBy: { id: bigint; name: string } | null
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
				list: result.map(notif => ({
					id: notif.id.toString(),
					templateKey: notif.templateKey,
					payload: notif.payload as unknown as JSON,
					user: notif.user
						? { id: notif.user.id.toString(), name: notif.user.name }
						: null,
					targetRole: notif.targetRole ?? null,
					clearedBy: notif.clearedBy ? { id: notif.clearedBy.id.toString() } : null,
					isRead: notif.isRead,
					readAt: notif.readAt?.getTime() ?? null,
					createdAt: notif.createdAt.getTime(),
				})),
			}
		})
	}

	async create<T extends NotificationTemplateKey>(data: NotificationCreateData<T>) {
		const newData = RemoveKeyFromObjectImmutable(data, ['payload'])

		return await this.unitOfWork.execute(async transaction => {
			return await transaction.getRepository(NotificationRepository).create({
				data: {
					...newData,
					payload: data.payload,
				},
			})
		})
	}
}

export default NotificationService
