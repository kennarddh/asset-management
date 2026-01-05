import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface AssetCategoryCreateResponse {
	id: string
}

export interface AssetCategoryCreateData {
	name: string
	description: string
}

export interface AssetCategoryCreateOutput {
	id: string
}

const AssetCategoryCreateApi: ApiFunction<
	AssetCategoryCreateOutput,
	AssetCategoryCreateData
> = async data => {
	const result = await CallApi<AssetCategoryCreateResponse>('/v1/asset/category', 'POST', false, {
		data,
	})

	const outputData = result.data.data

	return {
		id: outputData.id,
	}
}

export default AssetCategoryCreateApi
