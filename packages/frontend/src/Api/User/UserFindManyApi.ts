import { UserSortField } from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction, FindManyData, FindManyOutput, FindManyResponse } from 'Api/Types'

type UserFindManyResponse = FindManyResponse<{
	id: string
	name: string
	username: string
	email: string
	canBeDisabled: boolean
	group: { id: string; name: string }
	createdBy: { id: string; name: string } | null
	disabledAt: number | null
	createdAt: number
	updatedAt: number
}>

export interface UserFindManySingleOutput {
	id: string
	name: string
	username: string
	email: string
	canBeDisabled: boolean
	group: { id: string; name: string }
	createdBy: { id: string; name: string } | null
	disabledAt: Date | null
	createdAt: Date
	updatedAt: Date
}

export type UserFindManyOutput = FindManyOutput<UserFindManySingleOutput>

export interface UserFindManyData extends FindManyData<UserSortField> {
	includeDisabled?: boolean
	search?: string
}

const UserFindManyApi: ApiFunction<UserFindManyOutput, UserFindManyData> = async data => {
	const result = await CallApi<UserFindManyResponse>('/v1/user', 'GET', true, {
		params: {
			pagination: data.pagination,
			sort: data.sort,
			search: data.search,
			includeDisabled: data.includeDisabled,
		},
	})

	const outputData = result.data.data

	return {
		pagination: outputData.pagination,
		list: outputData.list.map(user => ({
			id: user.id,
			name: user.name,
			username: user.username,
			email: user.email,
			canBeDisabled: user.canBeDisabled,
			group: user.group,
			createdBy: user.createdBy,
			disabledAt: user.disabledAt === null ? null : new Date(user.disabledAt),
			createdAt: new Date(user.createdAt),
			updatedAt: new Date(user.updatedAt),
		})),
	}
}

export default UserFindManyApi
