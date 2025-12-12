import { Order } from 'Services/OrderService'
import { User } from 'Services/UserService'

import ResourceAccessPolicy from '../ResourceAccessPolicy'

class IsCreatorOfOrder extends ResourceAccessPolicy<Order> {
	async hasAccess(user: User, context: Order) {
		return user.id === context.user.id
	}
}

export default IsCreatorOfOrder
