import { CelosiaResponse, Controller, ControllerRequest, DI } from '@celosiajs/core'

import z from 'zod/v4'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import NotificationService, { NotificationCountOptions } from 'Services/NotificationService'

class CountNotifications extends Controller {
	constructor(private notificationService = DI.get(NotificationService)) {
		super('CountNotifications')
	}

	public async index(
		data: JWTVerifiedData,
		request: ControllerRequest<CountNotifications>,
		response: CelosiaResponse,
	) {
		const { isRead } = request.query

		const options = RemoveUndefinedValueFromObject({
			filter: { isRead, userId: data.user.session.user.id },
		}) satisfies NotificationCountOptions

		try {
			const data = await this.notificationService.list(options)

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
			isRead: z.coerce.boolean().optional(),
		})
	}
}

export default CountNotifications
