import { AssetStatus } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

export interface AssetUpdateData {
	id: string
	name?: string
	description?: string
	maximumLendingDuration?: number
	minimumLendingDuration?: number
	requiresApproval?: boolean
	status?: AssetStatus
	categoryId?: string
	galleries?: {
		newImages: File[]
		existingIds: string[]
	}
}

const AssetUpdateApi: ApiFunction<null, AssetUpdateData> = async data => {
	const formData = new FormData()

	if (data.name !== undefined) {
		formData.append('name', data.name)
	}

	if (data.description !== undefined) {
		formData.append('description', data.description)
	}

	if (data.maximumLendingDuration !== undefined) {
		formData.append('maximumLendingDuration', data.maximumLendingDuration.toString())
	}

	if (data.minimumLendingDuration !== undefined) {
		formData.append('minimumLendingDuration', data.minimumLendingDuration.toString())
	}

	if (data.requiresApproval !== undefined) {
		formData.append('requiresApproval', data.requiresApproval ? 'true' : 'false')
	}

	if (data.status !== undefined) {
		formData.append('status', data.status)
	}

	if (data.categoryId !== undefined) {
		formData.append('categoryId', data.categoryId)
	}

	if (data.galleries !== undefined) {
		for (const file of data.galleries.newImages) {
			formData.append('galleries[newImages]', file)
		}

		for (const id of data.galleries.existingIds) {
			formData.append('galleries[existingIds]', id)
		}
	}

	await CallApi(`/v1/asset/${data.id}`, 'PATCH', true, {
		data: formData,
	})
}

export default AssetUpdateApi
