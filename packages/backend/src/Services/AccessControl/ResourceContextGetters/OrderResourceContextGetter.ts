import { CelosiaRequest, DI, EmptyObject } from '@celosiajs/core'

import OrderService, { Order } from 'Services/OrderService'

import { ResourceNotFoundError } from 'Errors'

import ResourceContextGetter from '../ResourceContextGetter'

class OrderResourceContextGetter extends ResourceContextGetter<Order> {
	async getContext(request: CelosiaRequest<EmptyObject, EmptyObject, { id: bigint }>) {
		const orderId = request.params.id

		const orderService = DI.get(OrderService)

		const order = await orderService.findById(orderId)

		if (order === null) throw new ResourceNotFoundError('order')

		return order
	}
}

export default OrderResourceContextGetter
