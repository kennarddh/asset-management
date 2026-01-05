import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface UserFindByIdResponse {
	id: string
	name: string
	username: string
	createdAt: number
	updatedAt: number
}

export interface UserFindByIdOutput {
	id: string
	name: string
	username: string
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
		createdAt: new Date(outputData.createdAt),
		updatedAt: new Date(outputData.updatedAt),
	}
}

export default UserFindByIdApi
