import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

export interface OrderCancelData {
	id: string
}

const OrderCancelApi: ApiFunction<null, OrderCancelData> = async data => {
	await CallApi(`/v1/order/${data.id}/cancel`, 'POST', false)
}

export default OrderCancelApi
