import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface AuthRefreshResponse {
	token: string
}

export interface AuthRefreshOutput {
	token: string
}

const AuthRefreshApi: ApiFunction<AuthRefreshOutput> = async () => {
	const result = await CallApi<AuthRefreshResponse>('/v1/auth/refresh', 'POST', false, {
		withCredentials: true,
	})

	const outputData = result.data.data

	return {
		token: outputData.token,
	}
}

export default AuthRefreshApi
