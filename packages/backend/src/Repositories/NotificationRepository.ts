import { UnpackArray } from 'Types/Types'

import { Prisma } from 'PrismaGenerated/client'

import { DataAccessError } from '../Errors'
import PrismaRepository from './PrismaRepository'
import { PaginationOptions } from './Types'

export interface NotificationQueryOptions {
	select?: Prisma.NotificationSelect
}

export interface NotificationQueryUniqueOptions extends NotificationQueryOptions {
	filter: Prisma.NotificationWhereUniqueInput
}

export interface NotificationQueryAllOptions extends NotificationQueryOptions {
	filter?: Prisma.NotificationWhereInput
	sort?:
		| Prisma.NotificationOrderByWithRelationInput
		| Prisma.NotificationOrderByWithRelationInput[]
	pagination?: PaginationOptions
}

export interface NotificationCountOptions {
	filter?: Prisma.NotificationWhereInput
	sort?:
		| Prisma.NotificationOrderByWithRelationInput
		| Prisma.NotificationOrderByWithRelationInput[]
}

export interface NotificationUpdateOptions {
	filter: Prisma.NotificationWhereUniqueInput
	data: Prisma.NotificationUpdateArgs['data']
}

export interface NotificationCreateOptions extends NotificationQueryOptions {
	data: Prisma.NotificationCreateArgs['data']
}

class NotificationRepository extends PrismaRepository {
	constructor(prisma: Prisma.TransactionClient) {
		super('NotificationRepository', prisma)
	}

	async findUnique<T = unknown>(options: NotificationQueryUniqueOptions) {
		try {
			const result = await this.prisma.notification.findUnique({
				where: options.filter,
				...(options.select !== undefined ? { select: options.select } : {}),
			})

			return result as (typeof result & T) | null
		} catch (error) {
			this.logger.error('Find unique.', error)

			throw new DataAccessError()
		}
	}

	async findMany<T = unknown>(options: NotificationQueryAllOptions = {}) {
		const pagination = this.buildPrismaPagination(options.pagination)

		try {
			const result = await this.prisma.notification.findMany({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
				...(options.select !== undefined ? { select: options.select } : {}),
				...(pagination !== undefined ? { skip: pagination.skip } : {}),
				...(pagination !== undefined ? { take: pagination.take } : {}),
			})

			return result as (UnpackArray<typeof result> & T)[]
		} catch (error) {
			this.logger.error('Find many.', error)

			throw new DataAccessError()
		}
	}

	async count(options: NotificationCountOptions): Promise<number> {
		try {
			return await this.prisma.notification.count({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
			})
		} catch (error) {
			this.logger.error('Count.', error)

			throw new DataAccessError()
		}
	}

	async create(options: NotificationCreateOptions) {
		try {
			return await this.prisma.notification.create({
				data: options.data,
				...(options.select !== undefined ? { select: options.select } : {}),
			})
		} catch (error) {
			this.logger.error('Create.', error)

			throw new DataAccessError()
		}
	}

	async update(options: NotificationUpdateOptions) {
		try {
			await this.prisma.notification.update({
				data: options.data,
				where: options.filter,
				select: { id: true },
			})
		} catch (error) {
			this.logger.error('Update.', error)

			throw new DataAccessError()
		}
	}
}

export default NotificationRepository
