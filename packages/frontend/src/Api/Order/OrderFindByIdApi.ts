import { OrderStatus } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface OrderFindByIdResponse {
	id: string
	description: string
	reason: string | null
	status: string
	quantity: number
	user: { id: string; name: string }
	asset: {
		id: string
		name: string
		galleries: { id: string; isThumbnail: boolean; url: string }[]
	}

	requestedAt: number
	updatedAt: number
	finishAt: number
	startAt: number
	approvedAt: number | null
	rejectedAt: number | null
	returnedAt: number | null
	canceledAt: number | null
}

export interface OrderFindByIdOutput {
	id: string
	description: string
	reason: string | null
	status: OrderStatus
	quantity: number
	user: { id: string; name: string }
	asset: {
		id: string
		name: string
		galleries: { id: string; isThumbnail: boolean; url: string }[]
	}
	requestedAt: Date
	updatedAt: Date
	finishAt: Date
	startAt: Date
	approvedAt: Date | null
	rejectedAt: Date | null
	returnedAt: Date | null
	canceledAt: Date | null
}

export interface OrderFindByIdData {
	id: string
}

const OrderFindByIdApi: ApiFunction<OrderFindByIdOutput, OrderFindByIdData> = async data => {
	const result = await CallApi<OrderFindByIdResponse>(`/v1/order/${data.id}`, 'GET', true)

	const outputData = result.data.data

	return {
		id: outputData.id,
		description: outputData.description,
		reason: outputData.reason,
		status: outputData.status as OrderStatus,
		quantity: outputData.quantity,
		user: outputData.user,
		asset: outputData.asset,
		requestedAt: new Date(outputData.requestedAt),
		updatedAt: new Date(outputData.updatedAt),
		finishAt: new Date(outputData.finishAt),
		startAt: new Date(outputData.startAt),
		approvedAt: outputData.approvedAt === null ? null : new Date(outputData.approvedAt),
		rejectedAt: outputData.rejectedAt === null ? null : new Date(outputData.rejectedAt),
		returnedAt: outputData.returnedAt === null ? null : new Date(outputData.returnedAt),
		canceledAt: outputData.canceledAt === null ? null : new Date(outputData.canceledAt),
	}
}

export default OrderFindByIdApi
