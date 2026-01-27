import { DI, Injectable, Service } from '@celosiajs/core'

import { OrderSortField, OrderStatus, SortOrder } from '@asset-management/common'

import { DeepPartialAndUndefined } from 'Types/Types'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import OrderRepository, { OrderQueryAllOptions } from 'Repositories/OrderRepository'
import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import { InvalidStateError, ResourceNotFoundError } from 'Errors'

import { Prisma } from 'PrismaGenerated/client'

import AssetService from './AssetService'
import ConfigurationService from './ConfigurationService/ConfigurationService'
import SchedulerService, { OrderJobData } from './SchedulerService'
import { FindManyOptions } from './Types'

export interface Order {
	id: bigint
	description: string
	reason: string | null
	status: OrderStatus
	user: { id: bigint; name: string }
	asset: {
		id: bigint
		name: string
		galleries: { id: bigint; url: string }[]
	}
	flags: {
		canBeApproved: boolean
		canBeRejected: boolean
		canBeReturned: boolean
		canBeCanceled: boolean
	}
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
		private assetService = DI.get(AssetService),
		private schedulerService = DI.get(SchedulerService),
	) {
		super('OrderService')
	}

	private transformData(
		data: Prisma.OrderGetPayload<{ select: OrderService['dataSelect'] }>,
	): Order {
		const status = data.status as OrderStatus

		return {
			id: data.id,
			description: data.description,
			reason: data.reason,
			status,
			user: { id: data.user.id, name: data.user.name },
			asset: { id: data.asset.id, name: data.asset.name, galleries: data.asset.galleries },
			flags: {
				canBeApproved: status === OrderStatus.Pending,
				canBeRejected: status === OrderStatus.Pending,
				canBeReturned: status === OrderStatus.Active || status === OrderStatus.Overdue,
				canBeCanceled: status === OrderStatus.Pending || status === OrderStatus.Approved,
			},
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
			user: { select: { id: true, name: true } },
			asset: {
				select: {
					id: true,
					name: true,
					galleries: { select: { id: true, url: true } },
				},
			},
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
				asset: {
					id: bigint
					name: string
					galleries: { id: bigint; url: string }[]
				}
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
				asset: {
					id: bigint
					name: string
					galleries: { id: bigint; url: string }[]
				}
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
					status: order.status,
					user: { id: order.user.id.toString(), name: order.user.name },
					asset: {
						id: order.asset.id.toString(),
						name: order.asset.name,
						galleries: order.asset.galleries.map(gallery => ({
							id: gallery.id.toString(),
							url: gallery.url,
						})),
					},
					flags: {
						canBeApproved: (order.status as OrderStatus) === OrderStatus.Pending,
						canBeRejected: (order.status as OrderStatus) === OrderStatus.Pending,
						canBeReturned:
							(order.status as OrderStatus) === OrderStatus.Active ||
							(order.status as OrderStatus) === OrderStatus.Overdue,
						canBeCanceled:
							(order.status as OrderStatus) === OrderStatus.Pending ||
							(order.status as OrderStatus) === OrderStatus.Approved,
					},
					requestedAt: order.requestedAt.getTime(),
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
		// TODO: Send notification to admin
		// TODO: Check for requireApproval

		const nowTime = new Date().getTime()

		if (data.startAt.getTime() <= nowTime)
			throw new InvalidStateError('create', 'invalidStartAt')

		if (data.finishAt.getTime() <= nowTime)
			throw new InvalidStateError('create', 'invalidFinishAt')

		const duration = data.finishAt.getTime() - data.startAt.getTime()

		if (duration <= 0) throw new InvalidStateError('create', 'invalidDuration')

		return await this.unitOfWork.execute(async transaction => {
			const asset = await this.assetService.findById(data.assetId)

			if (asset === null) throw new ResourceNotFoundError('asset')

			if (duration >= asset.maximumLendingDuration * 1000)
				throw new InvalidStateError('create', 'invalidDuration')

			if (duration < asset.minimumLendingDuration * 1000)
				throw new InvalidStateError('create', 'invalidDuration')

			const shouldAutoApprove = !asset.requiresApproval

			const initialStatus = shouldAutoApprove ? OrderStatus.Approved : OrderStatus.Pending
			const approvedAt = shouldAutoApprove ? new Date() : null
			const reason = shouldAutoApprove ? 'Auto-approved upon creation' : null

			const order = await transaction.getRepository(OrderRepository).create({
				data: {
					...data,
					status: initialStatus,
					approvedAt: approvedAt,
					reason: reason,
				},
			})

			if (shouldAutoApprove) {
				await this.handleOrderApprovedEffects(order.id, order.startAt, order.finishAt)

				// TODO: Send notification to admin that order was auto-approved
			} else {
				await this.schedulerService.addJob(
					'order-auto-cancel',
					{ orderId: order.id.toString(), targetStatus: OrderStatus.Canceled },
					data.startAt.getTime() - nowTime,
				)
			}

			return order
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

	private async handleOrderApprovedEffects(id: bigint, startAt: Date, finishAt: Date) {
		const nowTime = new Date().getTime()

		await this.schedulerService.addJob(
			'order-start',
			{ orderId: id.toString(), targetStatus: OrderStatus.Active },
			startAt.getTime() - nowTime,
		)

		await this.schedulerService.addJob(
			'order-finish',
			{ orderId: id.toString(), targetStatus: OrderStatus.Overdue },
			finishAt.getTime() - nowTime,
		)

		// TODO: Send notification to member
	}

	async approve(id: bigint, reason: string) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(id)

			if (order === null) throw new ResourceNotFoundError('order')

			const now = new Date()

			// TODO: Refactor error JSON format
			if (order.startAt.getTime() <= now.getTime())
				throw new InvalidStateError('approve', 'processed')

			if (order.status !== OrderStatus.Pending)
				throw new InvalidStateError('approve', 'processed')

			// TODO: Check for quantity availability at the booked timeframe

			await this.update(id, { status: OrderStatus.Approved, approvedAt: now, reason })

			await this.handleOrderApprovedEffects(id, order.startAt, order.finishAt)
		})
	}

	async reject(id: bigint, reason: string) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(id)

			if (order === null) throw new ResourceNotFoundError('order')

			const now = new Date()

			// TODO: Refactor error JSON format
			if (order.startAt.getTime() <= now.getTime())
				throw new InvalidStateError('reject', 'processed')

			if (order.status !== OrderStatus.Pending)
				throw new InvalidStateError('reject', 'processed')

			await this.update(id, { status: OrderStatus.Rejected, rejectedAt: now, reason })

			// TODO: Send notification to member
		})
	}

	async cancel(id: bigint) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(id)

			if (order === null) throw new ResourceNotFoundError('order')

			// TODO: Refactor error JSON format
			if (!(order.status === OrderStatus.Approved || order.status === OrderStatus.Pending))
				throw new InvalidStateError('cancel', 'processed')

			await this.update(id, { status: OrderStatus.Canceled, canceledAt: new Date() })
		})
	}

	async return(id: bigint) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(id)

			if (order === null) throw new ResourceNotFoundError('order')

			// TODO: Refactor error JSON format
			if (!(order.status === OrderStatus.Active || order.status === OrderStatus.Overdue))
				throw new InvalidStateError('return', 'processed')

			const isLate = new Date().getTime() > order.finishAt.getTime()

			await this.update(id, {
				status: isLate ? OrderStatus.ReturnedLate : OrderStatus.Returned,
				returnedAt: new Date(),
			})

			// TODO: Send notification to member
		})
	}

	async processScheduledJob(jobName: string, data: OrderJobData) {
		await this.unitOfWork.execute(async () => {
			const order = await this.findById(BigInt(data.orderId))

			if (order === null) {
				this.logger.warn(`Order with ID ${data.orderId} not found for job ${jobName}`)

				throw new ResourceNotFoundError('order')
			}

			if (jobName === 'order-auto-cancel') {
				if (order.status !== OrderStatus.Pending) {
					this.logger.debug(
						`Order with ID ${data.orderId} is in status ${order.status}, skipping auto-cancel.`,
					)

					return
				}

				await this.cancel(BigInt(data.orderId))
			} else if (jobName === 'order-start') {
				if (order.status !== OrderStatus.Approved) {
					this.logger.debug(
						`Order with ID ${data.orderId} is in status ${order.status}, skipping start.`,
					)

					return
				}

				await this.update(BigInt(data.orderId), { status: OrderStatus.Active })
			} else if (jobName === 'order-finish') {
				if (order.status !== OrderStatus.Active) {
					this.logger.debug(
						`Order with ID ${data.orderId} is in status ${order.status}, skipping finish.`,
					)

					return
				}

				await this.update(BigInt(data.orderId), { status: OrderStatus.Overdue })
			} else {
				this.logger.warn(`Unknown job name: ${jobName}`)
			}
		})
	}
}

export default OrderService
