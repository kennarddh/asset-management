import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import z from 'zod/v4'

import AuthService from 'Services/AuthService'
import ConfigurationService from 'Services/ConfigurationService/ConfigurationService'
import { TokenExpiredError, TokenVerifyError } from 'Services/Token/Errors'

import { UnauthorizedError } from 'Errors'

class Refresh extends Controller {
	constructor(
		private authService = DI.get(AuthService),
		private configurationService = DI.get(ConfigurationService),
	) {
		super('AuthRefresh')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<Refresh>,
		response: CelosiaResponse,
	) {
		const { refreshToken: currentRefreshToken } = request.cookies

		try {
			const { accessToken, refreshToken } =
				await this.authService.refresh(currentRefreshToken)

			response.cookie('refreshToken', refreshToken, {
				secure: this.configurationService.configurations.nodeEnv === 'production',
				httpOnly: true,
				sameSite: 'lax',
			})

			return response.status(200).json({
				errors: {},
				data: {
					token: accessToken,
				},
			})
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				return response.status(401).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.RefreshToken,
								kind: ApiErrorKind.Expired,
							},
						],
					},
					data: {},
				})
			} else if (error instanceof TokenVerifyError) {
				return response.status(401).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.RefreshToken,
								kind: ApiErrorKind.Invalid,
							},
						],
					},
					data: {},
				})
			} else if (error instanceof UnauthorizedError) {
				return response.status(401).json({
					errors: {
						others: [
							{
								resource: null,
								kind: ApiErrorKind.Unauthorized,
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

	public override get cookies() {
		return z.object({
			refreshToken: z.string(),
		})
	}
}

export default Refresh
