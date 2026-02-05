import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface NotificationCountResponse {
	count: number
}

export interface NotificationCountOutput {
	count: number
}

export interface NotificationCountData {
	isRead?: boolean
}

const NotificationCountApi: ApiFunction<
	NotificationCountOutput,
	NotificationCountData
> = async data => {
	const result = await CallApi<NotificationCountResponse>('/v1/notification/count', 'GET', true, {
		params: {
			...(data.isRead !== undefined
				? {
						isRead: data.isRead,
					}
				: {}),
		},
	})

	const outputData = result.data.data

	return {
		count: outputData.count,
	}
}

export default NotificationCountApi
