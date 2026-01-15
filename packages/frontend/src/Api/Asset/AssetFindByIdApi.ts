import { AssetStatus } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface AssetFindByIdResponse {
	id: string
	name: string
	description: string
	category: { id: string; name: string }
	maximumLendingDuration: number
	minimumLendingDuration: number
	requiresApproval: boolean
	status: string
	galleries: { id: string; url: string }[]
	createdAt: number
	updatedAt: number
}

export interface AssetFindByIdOutput {
	id: string
	name: string
	description: string
	category: { id: string; name: string }
	maximumLendingDuration: number
	minimumLendingDuration: number
	requiresApproval: boolean
	status: AssetStatus
	galleries: { id: string; url: string }[]
	createdAt: Date
	updatedAt: Date
}

export interface AssetFindByIdData {
	id: string
}

const AssetFindByIdApi: ApiFunction<AssetFindByIdOutput, AssetFindByIdData> = async data => {
	const result = await CallApi<AssetFindByIdResponse>(`/v1/asset/${data.id}`, 'GET', true)

	const outputData = result.data.data

	return {
		id: outputData.id,
		name: outputData.name,
		description: outputData.description,
		category: outputData.category,
		maximumLendingDuration: outputData.maximumLendingDuration,
		minimumLendingDuration: outputData.minimumLendingDuration,
		requiresApproval: outputData.requiresApproval,
		status: outputData.status as AssetStatus,
		galleries: outputData.galleries,
		createdAt: new Date(outputData.createdAt),
		updatedAt: new Date(outputData.updatedAt),
	}
}

export default AssetFindByIdApi
