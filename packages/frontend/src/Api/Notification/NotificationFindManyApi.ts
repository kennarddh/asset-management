import {
	NotificationSortField,
	NotificationTemplateKey,
	NotificationTemplatePayload,
} from '@asset-management/common'

import CallApi from 'Api/CallApi'
import { ApiFunction, FindManyData, FindManyOutput, FindManyResponse } from 'Api/Types'

type NotificationFindManyResponse = FindManyResponse<{
	id: string
	templateKey: string
	payload: string
	user: { id: string; name: string }
	isRead: boolean
	readAt: number | null
	createdAt: number
}>

export type NotificationFindManySingleOutput = {
	[K in NotificationTemplateKey]: {
		id: string
		templateKey: K
		payload: NotificationTemplatePayload[K]
		user: { id: string; name: string }
		isRead: boolean
		readAt: Date | null
		createdAt: Date
	}
}[NotificationTemplateKey]

export type NotificationFindManyOutput = FindManyOutput<NotificationFindManySingleOutput>

export interface NotificationFindManyData extends FindManyData<NotificationSortField> {
	isRead?: boolean
}

const NotificationFindManyApi: ApiFunction<
	NotificationFindManyOutput,
	NotificationFindManyData
> = async data => {
	const result = await CallApi<NotificationFindManyResponse>('/v1/notification', 'GET', true, {
		params: {
			pagination: data.pagination,
			sort: data.sort,
			...(data.isRead !== undefined
				? {
						isRead: data.isRead,
					}
				: {}),
		},
	})

	const outputData = result.data.data

	return {
		pagination: outputData.pagination,
		list: outputData.list.map(notification => {
			const templateKey = notification.templateKey as NotificationTemplateKey

			return {
				id: notification.id,
				templateKey,
				payload:
					notification.payload as unknown as NotificationTemplatePayload[typeof templateKey],
				user: notification.user,
				isRead: notification.isRead,
				createdAt: new Date(notification.createdAt),
				readAt: notification.readAt === null ? null : new Date(notification.readAt),
			} as NotificationFindManySingleOutput
		}),
	}
}

export default NotificationFindManyApi
