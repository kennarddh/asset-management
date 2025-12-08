import { User } from 'Services/UserService'

import ResourceAccessPolicy from '../ResourceAccessPolicy'

class IsSameUser extends ResourceAccessPolicy<User> {
	async hasAccess(user: User, context: User) {
		return user.id === context.id
	}
}

export default IsSameUser
