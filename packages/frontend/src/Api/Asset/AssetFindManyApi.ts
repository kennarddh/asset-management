import { AssetSortField, AssetStatus } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction, FindManyData, FindManyOutput, FindManyResponse } from 'Api/Types'

type AssetFindManyResponse = FindManyResponse<{
	id: string
	name: string
	description: string
	category: { id: string; name: string }
	quantity: number
	maximumLendingDuration: number
	requiresApproval: boolean
	status: string
	galleries: { id: string; url: string }[]
	createdAt: number
	updatedAt: number
}>

export interface AssetFindManySingleOutput {
	id: string
	name: string
	description: string
	category: { id: string; name: string }
	quantity: number
	maximumLendingDuration: number
	requiresApproval: boolean
	status: AssetStatus
	galleries: { id: string; url: string }[]
	createdAt: Date
	updatedAt: Date
}

export type AssetFindManyOutput = FindManyOutput<AssetFindManySingleOutput>

export interface AssetFindManyData extends FindManyData<AssetSortField> {
	search?: string
	categoryId?: bigint
	status?: AssetStatus[]
}

const AssetFindManyApi: ApiFunction<AssetFindManyOutput, AssetFindManyData> = async data => {
	const result = await CallApi<AssetFindManyResponse>('/v1/asset', 'GET', true, {
		params: {
			pagination: data.pagination,
			sort: data.sort,
			search: data.search,
			categoryId: data.categoryId,
			status: data.status,
		},
	})

	const outputData = result.data.data

	return {
		pagination: outputData.pagination,
		list: outputData.list.map(asset => ({
			id: asset.id,
			name: asset.name,
			description: asset.description,
			category: asset.category,
			quantity: asset.quantity,
			maximumLendingDuration: asset.maximumLendingDuration,
			requiresApproval: asset.requiresApproval,
			status: asset.status as AssetStatus,
			galleries: asset.galleries,
			createdAt: new Date(asset.createdAt),
			updatedAt: new Date(asset.updatedAt),
		})),
	}
}

export default AssetFindManyApi
