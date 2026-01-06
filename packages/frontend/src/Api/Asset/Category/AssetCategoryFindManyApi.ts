import { AssetCategorySortField } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction, FindManyData, FindManyOutput, FindManyResponse } from 'Api/Types'

type AssetCategoryFindManyResponse = FindManyResponse<{
	id: string
	name: string
	description: string
	createdAt: number
	updatedAt: number
}>

export interface AssetCategoryFindManySingleOutput {
	id: string
	name: string
	description: string

	createdAt: Date
	updatedAt: Date
}

export type AssetCategoryFindManyOutput = FindManyOutput<AssetCategoryFindManySingleOutput>

export interface AssetCategoryFindManyData extends FindManyData<AssetCategorySortField> {
	search?: string
}

const AssetCategoryFindManyApi: ApiFunction<
	AssetCategoryFindManyOutput,
	AssetCategoryFindManyData
> = async data => {
	const result = await CallApi<AssetCategoryFindManyResponse>('/v1/asset/category', 'GET', true, {
		params: {
			pagination: data.pagination,
			sort: data.sort,
			search: data.search,
		},
	})

	const outputData = result.data.data

	return {
		pagination: outputData.pagination,
		list: outputData.list.map(assetCategory => ({
			id: assetCategory.id,
			name: assetCategory.name,
			description: assetCategory.description,
			createdAt: new Date(assetCategory.createdAt),
			updatedAt: new Date(assetCategory.updatedAt),
		})),
	}
}

export default AssetCategoryFindManyApi
