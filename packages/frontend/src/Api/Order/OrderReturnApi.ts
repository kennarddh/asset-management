import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

export interface OrderReturnData {
	id: string
}

const OrderReturnApi: ApiFunction<null, OrderReturnData> = async data => {
	await CallApi(`/v1/order/${data.id}/return`, 'POST', true)
}

export default OrderReturnApi
