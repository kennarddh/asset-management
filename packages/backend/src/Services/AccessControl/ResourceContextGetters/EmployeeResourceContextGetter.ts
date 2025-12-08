import { CelosiaRequest, DI, EmptyObject } from '@celosiajs/core'

import UserService, { User } from 'Services/UserService'

import { ResourceNotFoundError } from 'Errors'

import ResourceContextGetter from '../ResourceContextGetter'

class UserResourceContextGetter extends ResourceContextGetter<User> {
	async getContext(request: CelosiaRequest<EmptyObject, EmptyObject, { id: bigint }>) {
		const userId = request.params.id

		const userService = DI.get(UserService)

		const user = await userService.findById(userId)

		if (user === null) throw new ResourceNotFoundError('User not found')

		return user
	}
}

export default UserResourceContextGetter
