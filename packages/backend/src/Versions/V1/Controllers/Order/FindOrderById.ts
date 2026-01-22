import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import z from 'zod/v4'

import OrderService from 'Services/OrderService'

class FindOrderById extends Controller {
	constructor(private orderService = DI.get(OrderService)) {
		super('FindOrderById')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<FindOrderById>,
		response: CelosiaResponse,
	) {
		const { id } = request.params

		try {
			const order = await this.orderService.findById(id)

			if (!order)
				return response.status(404).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.Order,
								kind: ApiErrorKind.NotFound,
							},
						],
					},
					data: {},
				})

			return response.status(200).json({
				errors: {},
				data: {
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
						canBeApproved: order.flags.canBeApproved,
						canBeRejected: order.flags.canBeRejected,
						canBeReturned: order.flags.canBeReturned,
					},
					requestedAt: order.requestedAt.getTime(),
					updatedAt: order.updatedAt.getTime(),
					finishAt: order.finishAt.getTime(),
					startAt: order.startAt.getTime(),
					approvedAt: order.approvedAt?.getTime() ?? null,
					rejectedAt: order.rejectedAt?.getTime() ?? null,
					returnedAt: order.returnedAt?.getTime() ?? null,
					canceledAt: order.canceledAt?.getTime() ?? null,
				},
			})
		} catch (error) {
			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.bigint().min(1n),
		})
	}
}

export default FindOrderById
