import { DI, Injectable, Service } from '@celosiajs/core'

import { OrderSortField, OrderStatus, SortOrder } from '@asset-management/common'

import { DeepPartialAndUndefined } from 'Types/Types'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import OrderRepository, { OrderQueryAllOptions } from 'Repositories/OrderRepository'
import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import { InvalidStateError, ResourceNotFoundError } from 'Errors'

import { Prisma } from 'PrismaGenerated/client'

import ConfigurationService from './ConfigurationService/ConfigurationService'
import { FindManyOptions } from './Types'

export interface Order {
	id: bigint
	description: string
	reason: string | null
	status: OrderStatus
	quantity: number
	user: { id: bigint; name: string }
	asset: { id: bigint; name: string }
	requestedAt: Date
	updatedAt: Date
	finishAt: Date
	startAt: Date
	approvedAt: Date | null
	rejectedAt: Date | null
	returnedAt: Date | null
	canceledAt: Date | null
}

export interface OrderCreateData {
	description: string
	quantity: number
	userId: bigint
	assetId: bigint
	finishAt: Date
	startAt: Date
}

export interface OrderUpdateData {
	reason: string | null
	status: OrderStatus
	approvedAt: Date | null
	rejectedAt: Date | null
	returnedAt: Date | null
	canceledAt: Date | null
}

export interface OrderRecordData {
	description: string
	quantity: number
	userId: bigint
	assetId: bigint
	finishAt: Date
	startAt: Date
}

export interface OrderFilterOptions {
	search?: string
	assetId?: bigint
	userId?: bigint
	status?: OrderStatus[]
}

export interface OrderFindManyOptions extends FindManyOptions<OrderSortField> {
	filter?: OrderFilterOptions
}

export interface OrderCountOptions {
	filter?: OrderFilterOptions
}

@Injectable()
class OrderService extends Service {
	constructor(
		private unitOfWork = DI.get(UnitOfWork),
		private configurationService = DI.get(ConfigurationService),
	) {
		super('OrderService')
	}

	private transformData(
		data: Prisma.OrderGetPayload<{ select: OrderService['dataSelect'] }>,
	): Order {
		return {
			id: data.id,
			description: data.description,
			reason: data.reason,
			status: data.status as OrderStatus,
			quantity: data.quantity,
			user: { id: data.user.id, name: data.user.name },
			asset: { id: data.asset.id, name: data.asset.name },
			requestedAt: data.requestedAt,
			updatedAt: data.updatedAt,
			finishAt: data.finishAt,
			startAt: data.startAt,
			approvedAt: data.approvedAt,
			rejectedAt: data.rejectedAt,
			returnedAt: data.returnedAt,
			canceledAt: data.canceledAt,
		}
	}

	private buildRepositoryFilterOptions(filter: OrderFilterOptions) {
		const repositoryFilter: Prisma.OrderWhereInput = {}

		if (filter.search !== undefined)
			repositoryFilter.OR = [
				{
					description: {
						contains: filter.search,
						mode: 'insensitive',
					},
				},
				{
					reason: {
						contains: filter.search,
						mode: 'insensitive',
					},
				},
			]

		if (filter.userId !== undefined) repositoryFilter.userId = filter.userId

		if (filter.assetId !== undefined) repositoryFilter.assetId = filter.assetId

		if (filter.status !== undefined) repositoryFilter.status = { in: filter.status }

		return repositoryFilter
	}

	private get dataSelect() {
		return {
			id: true,
			description: true,
			reason: true,
			status: true,
			quantity: true,
			user: { select: { id: true, name: true } },
			asset: { select: { id: true, name: true } },
			requestedAt: true,
			updatedAt: true,
			finishAt: true,
			startAt: true,
			approvedAt: true,
			rejectedAt: true,
			returnedAt: true,
			canceledAt: true,
		} satisfies Prisma.OrderSelect
	}

	async findById(id: bigint) {
		return await this.unitOfWork.execute(async transaction => {
			const result = await transaction.getRepository(OrderRepository).findUnique<{
				user: { id: bigint; name: string }
				asset: { id: bigint; name: string }
			}>({
				filter: { id },
				select: this.dataSelect,
			})

			if (result === null) return null

			return this.transformData(result)
		})
	}

	async findMany(options: OrderFindManyOptions = {}) {
		const repositoryOptions: OrderQueryAllOptions = {
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
			transaction.getRepository(OrderRepository).findMany<{
				user: { id: bigint; name: string }
				asset: { id: bigint; name: string }
			}>(repositoryOptions),
		)
	}

	async count(options: OrderCountOptions): Promise<number> {
		const repositoryOptions: OrderQueryAllOptions = {}

		if (options.filter !== undefined) {
			repositoryOptions.filter = this.buildRepositoryFilterOptions(options.filter)
		}

		return await this.unitOfWork.execute(async transaction =>
			transaction.getRepository(OrderRepository).count(repositoryOptions),
		)
	}

	async list(options: OrderFindManyOptions = {}) {
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
				list: result.map(order => ({
					id: order.id.toString(),
					description: order.description,
					reason: order.reason,
					status: order.status as OrderStatus,
					quantity: order.quantity,
					user: { id: order.user.id, name: order.user.name },
					asset: { id: order.asset.id, name: order.asset.name },
					requestedAt: order.requestedAt,
					updatedAt: order.updatedAt.getTime(),
					finishAt: order.finishAt.getTime(),
					startAt: order.startAt.getTime(),
					approvedAt: order.approvedAt?.getTime() ?? null,
					rejectedAt: order.rejectedAt?.getTime() ?? null,
					returnedAt: order.returnedAt?.getTime() ?? null,
					canceledAt: order.canceledAt?.getTime() ?? null,
				})),
			}
		})
	}

	async create(data: OrderCreateData) {
		return await this.unitOfWork.execute(async transaction => {
			return await transaction.getRepository(OrderRepository).create({
				data: {
					...data,
					status: OrderStatus.Active,
				},
			})
		})
	}

	async update(id: bigint, data: DeepPartialAndUndefined<OrderUpdateData>) {
		const updateData: Prisma.OrderUpdateArgs['data'] = RemoveUndefinedValueFromObject(data)

		await this.unitOfWork.execute(async transaction => {
			await transaction
				.getRepository(OrderRepository)
				.update({ filter: { id }, data: updateData })
		})
	}

	async approve(id: bigint, reason: string) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(id)

			if (order === null) throw new ResourceNotFoundError('order')

			// TODO: Refactor error JSON format
			if (order.status !== OrderStatus.Pending)
				throw new InvalidStateError('approve', 'processed')

			await this.update(id, { status: OrderStatus.Approved, approvedAt: new Date(), reason })

			// TODO: Send notification to member
			// TODO: Schedule at finishAt to update status to Overdue
			// TODO: Schedule at startAt to update status to Active
		})
	}

	async reject(id: bigint, reason: string) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(id)

			if (order === null) throw new ResourceNotFoundError('order')

			// TODO: Refactor error JSON format
			if (order.status !== OrderStatus.Pending)
				throw new InvalidStateError('reject', 'processed')

			await this.update(id, { status: OrderStatus.Rejected, rejectedAt: new Date(), reason })

			// TODO: Send notification to member
		})
	}

	async cancel(id: bigint) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(id)

			if (order === null) throw new ResourceNotFoundError('order')

			// TODO: Refactor error JSON format
			if (
				!(
					order.status === OrderStatus.Approved ||
					order.status === OrderStatus.Rejected ||
					order.status === OrderStatus.Pending
				)
			)
				throw new InvalidStateError('cancel', 'processed')

			await this.update(id, { status: OrderStatus.Cancelled, canceledAt: new Date() })
		})
	}

	async return(id: bigint) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(id)

			if (order === null) throw new ResourceNotFoundError('order')

			// TODO: Refactor error JSON format
			if (order.status !== OrderStatus.Active)
				throw new InvalidStateError('return', 'processed')

			const isLate = new Date().getTime() > order.finishAt.getTime()

			await this.update(id, {
				status: isLate ? OrderStatus.ReturnedLate : OrderStatus.Returned,
				returnedAt: new Date(),
			})

			// TODO: Send notification to member
		})
	}
}

export default OrderService
