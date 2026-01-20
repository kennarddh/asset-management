import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

export interface OrderApproveData {
	id: string
	reason: string
}

const OrderApproveApi: ApiFunction<null, OrderApproveData> = async data => {
	await CallApi(`/v1/order/${data.id}/approve`, 'POST', true, {
		data: { reason: data.reason },
	})
}

export default OrderApproveApi
