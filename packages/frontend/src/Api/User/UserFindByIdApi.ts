import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface UserFindByIdResponse {
	id: string
	name: string
	username: string
	email: string
	canBeDisabled: boolean
	group: { id: string; name: string }
	createdBy: { id: string; name: string } | null
	assignedLocations: { id: string; name: string }[]
	disabledAt: number | null
	createdAt: number
	updatedAt: number
}

export interface UserFindByIdOutput {
	id: string
	name: string
	username: string
	email: string
	canBeDisabled: boolean
	group: { id: string; name: string }
	createdBy: { id: string; name: string } | null
	assignedLocations: { id: string; name: string }[]
	disabledAt: Date | null
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
		email: outputData.email,
		canBeDisabled: outputData.canBeDisabled,
		group: outputData.group,
		createdBy: outputData.createdBy,
		assignedLocations: outputData.assignedLocations,
		disabledAt: outputData.disabledAt === null ? null : new Date(outputData.disabledAt),
		createdAt: new Date(outputData.createdAt),
		updatedAt: new Date(outputData.updatedAt),
	}
}

export default UserFindByIdApi
