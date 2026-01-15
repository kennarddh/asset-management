import { CelosiaResponse, Controller, ControllerRequest, DI } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import z from 'zod/v4'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import OrderService from 'Services/OrderService'

import { InvalidStateError, ResourceNotFoundError } from 'Errors'

class CreateOrder extends Controller {
	constructor(private orderService = DI.get(OrderService)) {
		super('CreateOrder')
	}

	public async index(
		data: JWTVerifiedData,
		request: ControllerRequest<CreateOrder>,
		response: CelosiaResponse,
	) {
		const { description, assetId, finishAt, startAt } = request.body

		try {
			const asset = await this.orderService.create({
				description,
				userId: data.user.session.user.id,
				assetId,
				finishAt: new Date(finishAt),
				startAt: new Date(startAt),
			})

			return response.status(200).json({
				errors: {},
				data: {
					id: asset.id.toString(),
				},
			})
		} catch (error) {
			if (error instanceof ResourceNotFoundError) {
				if (error.resource === 'asset') {
					return response.status(404).json({
						errors: {
							others: [
								{
									resource: ApiErrorResource.Asset,
									kind: ApiErrorKind.NotFound,
								},
							],
						},
						data: {},
					})
				}
			} else if (error instanceof InvalidStateError) {
				if (
					error.operation === 'create' &&
					(error.state === 'invalidStartAt' || error.state === 'invalidFinishAt')
				) {
					return response.status(409).json({
						errors: {
							others: [
								{
									resource: ApiErrorResource.DateTime,
									kind: ApiErrorKind.Invalid,
								},
							],
						},
						data: {},
					})
				} else if (error.operation === 'create' && error.state === 'invalidDuration') {
					return response.status(409).json({
						errors: {
							others: [
								{
									resource: ApiErrorResource.Duration,
									kind: ApiErrorKind.Invalid,
								},
							],
						},
						data: {},
					})
				}
			}

			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			description: z.string().trim(),
			assetId: z.coerce.bigint().min(1n),
			finishAt: z.int().min(0),
			startAt: z.int().min(0),
		})
	}
}

export default CreateOrder
