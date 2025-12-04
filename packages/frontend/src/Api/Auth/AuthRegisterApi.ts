import CallApi from 'Api/CallApi'
import { ApiFunction } from 'Api/Types'

interface AuthRegisterResponse {
	user: {
		id: string
	}
}

export interface AuthRegisterData {
	name: string
	username: string
	password: string
}

export interface AuthRegisterOutput {
	user: {
		id: string
	}
}

const AuthRegisterApi: ApiFunction<AuthRegisterOutput, AuthRegisterData> = async data => {
	const result = await CallApi<AuthRegisterResponse>('/v1/auth/register', 'POST', false, {
		data,
	})

	const outputData = result.data.data

	return {
		user: {
			id: outputData.user.id,
		},
	}
}

export default AuthRegisterApi
