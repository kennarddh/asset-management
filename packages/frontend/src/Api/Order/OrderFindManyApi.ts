import { OrderSortField, OrderStatus } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction, FindManyData, FindManyOutput, FindManyResponse } from 'Api/Types'

type OrderFindManyResponse = FindManyResponse<{
	id: string
	description: string
	reason: string | null
	status: string
	quantity: number
	user: { id: string; name: string }
	asset: { id: string; name: string }
	requestedAt: number
	updatedAt: number
	finishAt: number
	startAt: number
	approvedAt: number | null
	rejectedAt: number | null
	returnedAt: number | null
	canceledAt: number | null
}>

export interface OrderFindManySingleOutput {
	id: string
	description: string
	reason: string | null
	status: OrderStatus
	quantity: number
	user: { id: string; name: string }
	asset: { id: string; name: string }
	requestedAt: Date
	updatedAt: Date
	finishAt: Date
	startAt: Date
	approvedAt: Date | null
	rejectedAt: Date | null
	returnedAt: Date | null
	canceledAt: Date | null
}

export type OrderFindManyOutput = FindManyOutput<OrderFindManySingleOutput>

export interface OrderFindManyData extends FindManyData<OrderSortField> {
	search?: string
	assetId?: bigint
	userId?: bigint
	status?: OrderStatus[]
}

const OrderFindManyApi: ApiFunction<OrderFindManyOutput, OrderFindManyData> = async data => {
	const result = await CallApi<OrderFindManyResponse>('/v1/order', 'GET', true, {
		params: {
			pagination: data.pagination,
			sort: data.sort,
			search: data.search,
			assetId: data.assetId,
			userId: data.userId,
			status: data.status,
		},
	})

	const outputData = result.data.data

	return {
		pagination: outputData.pagination,
		list: outputData.list.map(order => ({
			id: order.id,
			description: order.description,
			reason: order.reason,
			status: order.status as OrderStatus,
			quantity: order.quantity,
			user: order.user,
			asset: order.asset,
			requestedAt: new Date(order.requestedAt),
			updatedAt: new Date(order.updatedAt),
			finishAt: new Date(order.finishAt),
			startAt: new Date(order.startAt),
			approvedAt: order.approvedAt === null ? null : new Date(order.approvedAt),
			rejectedAt: order.rejectedAt === null ? null : new Date(order.rejectedAt),
			returnedAt: order.returnedAt === null ? null : new Date(order.returnedAt),
			canceledAt: order.canceledAt === null ? null : new Date(order.canceledAt),
		})),
	}
}

export default OrderFindManyApi
