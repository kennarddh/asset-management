import { CelosiaRequest, DI, EmptyObject } from '@celosiajs/core'

import UserSessionService, { UserSession } from 'Services/UserSessionService'

import { ResourceNotFoundError } from 'Errors'

import ResourceContextGetter from '../ResourceContextGetter'

class UserSessionResourceContextGetter extends ResourceContextGetter<UserSession> {
	async getContext(request: CelosiaRequest<EmptyObject, EmptyObject, { id: bigint }>) {
		const userSessionId = request.params.id

		const userSessionService = DI.get(UserSessionService)

		const userSession = await userSessionService.findById(userSessionId)

		if (userSession === null) throw new ResourceNotFoundError('User session not found')

		return userSession
	}
}

export default UserSessionResourceContextGetter
