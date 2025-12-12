import { UnpackArray } from 'Types/Types'

import { Prisma } from 'PrismaGenerated/client'

import { DataAccessError } from '../Errors'
import PrismaRepository from './PrismaRepository'
import { PaginationOptions } from './Types'

export interface OrderQueryOptions {
	select?: Prisma.OrderSelect
}

export interface OrderQueryUniqueOptions extends OrderQueryOptions {
	filter: Prisma.OrderWhereUniqueInput
}

export interface OrderQueryAllOptions extends OrderQueryOptions {
	filter?: Prisma.OrderWhereInput
	sort?: Prisma.OrderOrderByWithRelationInput | Prisma.OrderOrderByWithRelationInput[]
	pagination?: PaginationOptions
}

export interface OrderCountOptions {
	filter?: Prisma.OrderWhereInput
	sort?: Prisma.OrderOrderByWithRelationInput | Prisma.OrderOrderByWithRelationInput[]
}

export interface OrderUpdateOptions {
	filter: Prisma.OrderWhereUniqueInput
	data: Prisma.OrderUpdateArgs['data']
}

export interface OrderCreateOptions extends OrderQueryOptions {
	data: Prisma.OrderCreateArgs['data']
}

class OrderRepository extends PrismaRepository {
	constructor(prisma: Prisma.TransactionClient) {
		super('OrderRepository', prisma)
	}

	async findUnique<T = unknown>(options: OrderQueryUniqueOptions) {
		try {
			const result = await this.prisma.order.findUnique({
				where: options.filter,
				...(options.select !== undefined ? { select: options.select } : {}),
			})

			return result as (typeof result & T) | null
		} catch (error) {
			this.logger.error('Find unique.', error)

			throw new DataAccessError()
		}
	}

	async findMany<T = unknown>(options: OrderQueryAllOptions = {}) {
		const pagination = this.buildPrismaPagination(options.pagination)

		try {
			const result = await this.prisma.order.findMany({
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

	async count(options: OrderCountOptions): Promise<number> {
		try {
			return await this.prisma.order.count({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
			})
		} catch (error) {
			this.logger.error('Count.', error)

			throw new DataAccessError()
		}
	}

	async create(options: OrderCreateOptions) {
		try {
			return await this.prisma.order.create({
				data: options.data,
				...(options.select !== undefined ? { select: options.select } : {}),
			})
		} catch (error) {
			this.logger.error('Create.', error)

			throw new DataAccessError()
		}
	}

	async update(options: OrderUpdateOptions) {
		try {
			await this.prisma.order.update({
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

export default OrderRepository
