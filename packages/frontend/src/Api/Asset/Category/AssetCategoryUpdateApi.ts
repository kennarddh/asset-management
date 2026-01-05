import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

export interface AssetCategoryUpdateData {
	id: string
	name?: string
	description?: string
}

const AssetCategoryUpdateApi: ApiFunction<null, AssetCategoryUpdateData> = async data => {
	await CallApi(`/v1/asset/category/${data.id}`, 'PATCH', true, {
		data,
	})
}

export default AssetCategoryUpdateApi
