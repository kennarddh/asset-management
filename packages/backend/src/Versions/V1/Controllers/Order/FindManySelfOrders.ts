import { CelosiaResponse, Controller, ControllerRequest, DI } from '@celosiajs/core'

import { OrderSortField, OrderStatus, SortOrder } from '@asset-management/common'
import z from 'zod/v4'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import OrderService, { OrderFindManyOptions } from 'Services/OrderService'

import ZodPagination from 'Validations/Zod/ZodPagination'

class FindManySelfOrders extends Controller {
	constructor(private orderService = DI.get(OrderService)) {
		super('FindManySelfOrders')
	}

	public async index(
		data: JWTVerifiedData,
		request: ControllerRequest<FindManySelfOrders>,
		response: CelosiaResponse,
	) {
		const { search, assetId, status, pagination, sort } = request.query

		const options = RemoveUndefinedValueFromObject({
			filter: { search, assetId, userId: data.user.session.user.id, status },
			pagination,
			sort,
		}) satisfies OrderFindManyOptions

		try {
			const data = await this.orderService.list(options)

			return response.status(200).json({
				errors: {},
				data,
			})
		} catch (error) {
			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get query() {
		return z.object({
			search: z.string().optional(),
			assetId: z.coerce.bigint().min(1n).optional(),
			status: z.enum(OrderStatus).array().optional(),
			pagination: ZodPagination.optional(),
			sort: z
				.object({
					field: z.enum(OrderSortField),
					order: z.enum(SortOrder).optional(),
				})
				.optional(),
		})
	}
}

export default FindManySelfOrders
