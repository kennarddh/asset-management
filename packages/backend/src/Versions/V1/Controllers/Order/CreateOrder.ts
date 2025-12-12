import { CelosiaResponse, Controller, ControllerRequest, DI } from '@celosiajs/core'

import z from 'zod/v4'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import OrderService from 'Services/OrderService'

class CreateOrder extends Controller {
	constructor(private orderService = DI.get(OrderService)) {
		super('CreateOrder')
	}

	public async index(
		data: JWTVerifiedData,
		request: ControllerRequest<CreateOrder>,
		response: CelosiaResponse,
	) {
		const { description, quantity, assetId, finishAt, startAt } = request.body

		try {
			const asset = await this.orderService.create({
				description,
				quantity,
				userId: data.user.session.user.id,
				assetId,
				finishAt: new Date(finishAt * 1000), // Seconds to milliseconds
				startAt: new Date(startAt * 1000), // Seconds to milliseconds
			})

			return response.status(200).json({
				errors: {},
				data: {
					id: asset.id.toString(),
				},
			})
		} catch (error) {
			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			description: z.string().trim(),
			quantity: z.int().min(1),
			assetId: z.coerce.bigint().min(1n),
			finishAt: z.int().min(0),
			startAt: z.int().min(0),
		})
	}
}

export default CreateOrder
