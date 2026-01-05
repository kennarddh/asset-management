import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface AssetCategoryFindByIdResponse {
	id: string
	name: string
	description: string
	createdAt: number
	updatedAt: number
}

export interface AssetCategoryFindByIdOutput {
	id: string
	name: string
	description: string
	createdAt: Date
	updatedAt: Date
}

export interface AssetCategoryFindByIdData {
	id: string
}

const AssetCategoryFindByIdApi: ApiFunction<
	AssetCategoryFindByIdOutput,
	AssetCategoryFindByIdData
> = async data => {
	const result = await CallApi<AssetCategoryFindByIdResponse>(
		`/v1/asset/category/${data.id}`,
		'GET',
		true,
	)

	const outputData = result.data.data

	return {
		id: outputData.id,
		name: outputData.name,
		description: outputData.description,
		createdAt: new Date(outputData.createdAt),
		updatedAt: new Date(outputData.updatedAt),
	}
}

export default AssetCategoryFindByIdApi
