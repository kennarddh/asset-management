import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

const AuthLogoutApi: ApiFunction = async () => {
	await CallApi('/v1/auth/logout', 'POST', true)
}

export default AuthLogoutApi
