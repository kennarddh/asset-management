import { CelosiaResponse, Controller, ControllerRequest, DI } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import UserSessionService from 'Services/UserSessionService'

import { InvalidStateError, ResourceNotFoundError } from 'Errors'

class Logout extends Controller {
	constructor(private userSessionService = DI.get(UserSessionService)) {
		super('AuthLogout')
	}

	public async index(
		data: JWTVerifiedData,
		_: ControllerRequest<Logout>,
		response: CelosiaResponse,
	) {
		try {
			await this.userSessionService.logout(data.user.session.id)

			return response.status(204).send()
		} catch (error) {
			if (error instanceof ResourceNotFoundError && error.resource === 'userSession') {
				this.logger.error('User session not found.', error)
			} else if (
				error instanceof InvalidStateError &&
				error.operation === 'logout' &&
				error.state === 'sessionInactive'
			) {
				return response.status(409).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.UserSession,
								kind: ApiErrorKind.Inactive,
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
}

export default Logout
