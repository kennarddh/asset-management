import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface OrderCreateResponse {
	id: string
}

export interface OrderCreateData {
	description: string
	quantity: number
	assetId: bigint
	finishAt: Date
	startAt: Date
}

export interface OrderCreateOutput {
	id: string
}

const OrderCreateApi: ApiFunction<OrderCreateOutput, OrderCreateData> = async data => {
	const result = await CallApi<OrderCreateResponse>('/v1/order', 'POST', false, {
		data,
	})

	const outputData = result.data.data

	return {
		id: outputData.id,
	}
}

export default OrderCreateApi
