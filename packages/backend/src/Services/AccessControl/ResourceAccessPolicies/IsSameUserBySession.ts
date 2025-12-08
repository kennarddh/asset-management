import { User } from 'Services/UserService'
import { UserSession } from 'Services/UserSessionService'

import ResourceAccessPolicy from '../ResourceAccessPolicy'

class IsSameUserBySession extends ResourceAccessPolicy<UserSession> {
	async hasAccess(user: User, context: UserSession) {
		return user.id === context.user.id
	}
}

export default IsSameUserBySession
