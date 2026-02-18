import { CelosiaResponse, Controller, ControllerRequest, DI } from '@celosiajs/core'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import NotificationService from 'Services/NotificationService'

class ReadAllNotifications extends Controller {
	constructor(private notificationService = DI.get(NotificationService)) {
		super('ReadAllNotifications')
	}

	public async index(
		data: JWTVerifiedData,
		_: ControllerRequest<ReadAllNotifications>,
		response: CelosiaResponse,
	) {
		try {
			await this.notificationService.markAllRead(data.user.data)

			return response.status(204).send()
		} catch (error) {
			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}
}

export default ReadAllNotifications
