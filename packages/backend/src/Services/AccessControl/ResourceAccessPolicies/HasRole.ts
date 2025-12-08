import { UserRole } from '@asset-management/common'

import { User } from 'Services/UserService'

import ResourceAccessPolicy from '../ResourceAccessPolicy'

class HasPermission extends ResourceAccessPolicy<undefined> {
	constructor(private role: UserRole) {
		super()
	}

	async hasAccess(user: User) {
		return user.role === this.role
	}
}

export default HasPermission
