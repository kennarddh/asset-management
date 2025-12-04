import { DI, Injectable, Service } from '@celosiajs/core'

import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import ConfigurationService from 'Services/ConfigurationService/ConfigurationService'
import PasswordHashService from 'Services/PasswordHashService'
import AccessTokenService, { AccessTokenJWTPayload } from 'Services/Token/AccessTokenService'
import RefreshTokenService, { RefreshTokenJWTPayload } from 'Services/Token/RefreshTokenService'
import UserService from 'Services/UserService'
import UserSessionService from 'Services/UserSessionService'

import { ResourceNotFoundError, UnauthorizedError } from 'Errors'

import { UserSession } from 'PrismaGenerated/client'

@Injectable()
class AuthService extends Service {
	constructor(
		private unitOfWork = DI.get(UnitOfWork),
		private userService = DI.get(UserService),
		private userSessionService = DI.get(UserSessionService),
		private passwordHashService = DI.get(PasswordHashService),
		private accessTokenService = DI.get(AccessTokenService),
		private refreshTokenService = DI.get(RefreshTokenService),
		private configurationService = DI.get(ConfigurationService),
	) {
		super('AuthService')
	}

	async createTokens(userSession: UserSession, currentTime: number, expireAt: number) {
		const accessTokenPayload = {
			jti: userSession.accessTokenJti,
			iat: currentTime,
		} satisfies AccessTokenJWTPayload

		const accessToken = await this.accessTokenService.sign(accessTokenPayload)

		const refreshTokenPayload = {
			jti: userSession.refreshTokenJti,
			iat: currentTime,
			exp: expireAt,
		} satisfies RefreshTokenJWTPayload

		const refreshToken = await this.refreshTokenService.sign(refreshTokenPayload)

		return {
			accessToken,
			refreshToken,
		}
	}

	async login(username: string, password: string, ipAddress: string) {
		return await this.unitOfWork.execute(async () => {
			const user = await this.userService.findByUsername(username)

			if (user === null) throw new UnauthorizedError()

			const isPasswordCorrect = await this.passwordHashService.verify(user.password, password)

			if (!isPasswordCorrect) throw new UnauthorizedError()

			const currentTime = Math.floor(new Date().getTime() / 1000)
			const expireAt =
				currentTime + this.configurationService.configurations.tokens.refresh.expire

			const userSession = await this.userSessionService.create({
				userId: user.id,
				ipAddress,
				expireAt: new Date(expireAt * 1000),
			})

			const tokens = await this.createTokens(userSession, currentTime, expireAt)

			return {
				tokens: {
					accessToken: `Bearer ${tokens.accessToken}`,
					refreshToken: tokens.refreshToken,
				},
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
				},
			}
		})
	}

	async register(name: string, username: string, password: string) {
		const user = await this.userService.create({
			name,
			username,
			password,
		})

		return { user }
	}

	async refresh(refreshToken: string) {
		const currentRefreshTokenPayload = await this.refreshTokenService.verify(refreshToken)

		return await this.unitOfWork.execute(async () => {
			const userSession = await this.userSessionService.findByRefreshTokenJti(
				currentRefreshTokenPayload.jti,
			)

			if (userSession === null) {
				this.logger.error('User session not found while refresh.', {
					refreshTokenJti: currentRefreshTokenPayload.jti,
				})

				throw new ResourceNotFoundError('userSession')
			}

			if (!this.userSessionService.isSessionActive(userSession)) throw new UnauthorizedError()

			// TODO: Handle this potential account compromise better, e.g. add event log, send notification, or revoke all sessions for this user.
			// Potential account compromise, if the refresh token was used after the last refresh token was issued.
			if (
				currentRefreshTokenPayload.iat <
				userSession.lastRefreshAt.getTime() / 1000 -
					this.configurationService.configurations.tokens.refresh.clockTolerance
			)
				throw new UnauthorizedError()

			const currentTime = Math.floor(new Date().getTime() / 1000)
			const expireAt =
				currentTime + this.configurationService.configurations.tokens.refresh.expire

			await this.userSessionService.refresh(userSession.id, new Date(expireAt * 1000))

			const newUserSession = await this.userSessionService.findById(userSession.id)

			if (newUserSession === null) {
				this.logger.error('User session not found after refresh.', {
					userSessionId: userSession.id,
				})

				throw new ResourceNotFoundError('userSession')
			}
			const tokens = await this.createTokens(
				{
					...newUserSession,
					userId: newUserSession.user.id,
				},
				currentTime,
				expireAt,
			)

			return {
				accessToken: `Bearer ${tokens.accessToken}`,
				refreshToken: tokens.refreshToken,
			}
		})
	}

	async verifyAccessToken(accessToken: string) {
		const currentAccessTokenPayload = await this.accessTokenService.verify(accessToken)

		const userSession = await this.userSessionService.findByAccessTokenJti(
			currentAccessTokenPayload.jti,
		)

		if (userSession === null) {
			this.logger.error('User session not found while verify.', {
				accessTokenJti: currentAccessTokenPayload.jti,
			})

			throw new ResourceNotFoundError('userSession')
		}

		if (!this.userSessionService.isSessionActive(userSession)) throw new UnauthorizedError()

		return userSession
	}

	async findUserForGetSession(userId: bigint) {
		return await this.unitOfWork.execute(async () => {
			const user = await this.userService.findById(userId)

			if (user === null) throw new ResourceNotFoundError('user')

			return {
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
				},
			}
		})
	}
}

export default AuthService
