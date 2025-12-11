import { CelosiaResponse, Controller, ControllerRequest, DI } from '@celosiajs/core'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import AuthService from 'Services/AuthService'

import { ResourceNotFoundError } from 'Errors'

class Session extends Controller {
	constructor(private authService = DI.get(AuthService)) {
		super('AuthSession')
	}

	public async index(
		data: JWTVerifiedData,
		request: ControllerRequest<Session>,
		response: CelosiaResponse,
	) {
		const userSession = data.user.session

		try {
			const { user } = await this.authService.findUserForGetSession(userSession.user.id)

			return response.status(200).json({
				errors: {},
				data: {
					id: userSession.id.toString(),
					user: {
						id: user.id.toString(),
						name: user.name,
						username: user.username,
						role: user.role,
					},
					ipAddress: userSession.ipAddress,
					createdAt: userSession.createdAt.getTime(),
					expireAt: userSession.expireAt.getTime(),
					lastRefreshAt: userSession.lastRefreshAt.getTime(),
				},
			})
		} catch (error) {
			if (error instanceof ResourceNotFoundError) {
				if (error.resource === 'user') {
					this.logger.error('User not found during session endpoint.', {
						userId: userSession.user.id,
						requestId: request.id,
						error,
					})
				}
			} else {
				this.logger.error('Other.', error)
			}

			return response.sendInternalServerError()
		}
	}
}

export default Session
