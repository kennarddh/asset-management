import { AssetStatus } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

export interface AssetUpdateData {
	id: string
	name?: string
	description?: string
	quantity?: number
	maximumLendingDuration?: number
	minimumLendingDuration?: number
	requiresApproval?: boolean
	status?: AssetStatus
	categoryId?: string
	galleries?: { url: string }[]
}

const AssetUpdateApi: ApiFunction<null, AssetUpdateData> = async data => {
	await CallApi(`/v1/asset/${data.id}`, 'PATCH', true, {
		data,
	})
}

export default AssetUpdateApi
