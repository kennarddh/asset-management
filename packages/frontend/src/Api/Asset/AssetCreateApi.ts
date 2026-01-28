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
	galleries: File[]
}

export interface AssetCreateOutput {
	id: string
}

const AssetCreateApi: ApiFunction<AssetCreateOutput, AssetCreateData> = async data => {
	const formData = new FormData()

	formData.append('name', data.name)
	formData.append('description', data.description)
	formData.append('maximumLendingDuration', data.maximumLendingDuration.toString())
	formData.append('minimumLendingDuration', data.minimumLendingDuration.toString())
	formData.append('requiresApproval', data.requiresApproval ? 'true' : 'false')
	formData.append('status', data.status)
	formData.append('categoryId', data.categoryId)

	for (const file of data.galleries) {
		formData.append('galleries', file)
	}

	const result = await CallApi<AssetCreateResponse>('/v1/asset', 'POST', true, {
		data: formData,
	})

	const outputData = result.data.data

	return {
		id: outputData.id,
	}
}

export default AssetCreateApi
