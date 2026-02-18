import { UserRole } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface UserFindByIdResponse {
	id: string
	name: string
	username: string
	role: string
	createdBy: { id: string; name: string } | null
	createdAt: number
	updatedAt: number
}

export interface UserFindByIdOutput {
	id: string
	name: string
	username: string
	role: UserRole
	createdBy: { id: string; name: string } | null
	createdAt: Date
	updatedAt: Date
}

export interface UserFindByIdData {
	id: string
}

const UserFindByIdApi: ApiFunction<UserFindByIdOutput, UserFindByIdData> = async data => {
	const result = await CallApi<UserFindByIdResponse>(`/v1/user/${data.id}`, 'GET', true)

	const outputData = result.data.data

	return {
		id: outputData.id,
		name: outputData.name,
		username: outputData.username,
		role: outputData.role as UserRole,
		createdBy:
			outputData.createdBy === null
				? null
				: {
						id: outputData.createdBy.id,
						name: outputData.createdBy.name,
					},
		createdAt: new Date(outputData.createdAt),
		updatedAt: new Date(outputData.updatedAt),
	}
}

export default UserFindByIdApi
