import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

const NotificationReadAllApi: ApiFunction = async () => {
	await CallApi('/v1/notification/read-all', 'POST', true)
}

export default NotificationReadAllApi
