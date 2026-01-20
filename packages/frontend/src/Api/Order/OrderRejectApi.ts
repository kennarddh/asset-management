import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

export interface OrderRejectData {
	id: string
	reason: string
}

const OrderRejectApi: ApiFunction<null, OrderRejectData> = async data => {
	await CallApi(`/v1/order/${data.id}/reject`, 'POST', true, {
		data: { reason: data.reason },
	})
}

export default OrderRejectApi
