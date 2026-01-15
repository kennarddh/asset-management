import { AssetStatus } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface AssetCreateResponse {
	id: string
}

export interface AssetCreateData {
	name: string
	description: string
	maximumLendingDuration: number
	minimumLendingDuration: number
	requiresApproval: boolean
	status: AssetStatus
	categoryId: string
	galleries: { url: string }[]
}

export interface AssetCreateOutput {
	id: string
}

const AssetCreateApi: ApiFunction<AssetCreateOutput, AssetCreateData> = async data => {
	const result = await CallApi<AssetCreateResponse>('/v1/asset', 'POST', false, {
		data,
	})

	const outputData = result.data.data

	return {
		id: outputData.id,
	}
}

export default AssetCreateApi
