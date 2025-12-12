import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import z from 'zod/v4'

import OrderService from 'Services/OrderService'

import { InvalidStateError, ResourceNotFoundError } from 'Errors'

class RejectOrder extends Controller {
	constructor(private orderService = DI.get(OrderService)) {
		super('RejectOrder')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<RejectOrder>,
		response: CelosiaResponse,
	) {
		const { id, reason } = request.params

		try {
			await this.orderService.reject(id, reason)

			return response.sendStatus(204)
		} catch (error) {
			if (error instanceof ResourceNotFoundError && error.resource === 'order') {
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
			} else if (
				error instanceof InvalidStateError &&
				error.operation === 'cancel' &&
				error.state === 'processed'
			) {
				return response.status(409).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.Order,
								kind: ApiErrorKind.Processed,
							},
						],
					},
					data: {},
				})
			}

			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.bigint().min(1n),
			reason: z.string().trim(),
		})
	}
}

export default RejectOrder
