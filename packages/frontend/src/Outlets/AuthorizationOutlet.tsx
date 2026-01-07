import { FC } from 'react'

import { Navigate, Outlet } from 'react-router'

import { UserRole } from '@asset-management/common'
import useAuthStore from 'Stores/AuthStore'

export interface AuthorizationOutletProps {
	forNonLoggedIn?: boolean
}

const AuthorizationOutlet: FC<AuthorizationOutletProps> = props => {
	const isLoggedIn = useAuthStore(state => state.isLoggedIn)
	const isLoading = useAuthStore(state => state.isLoading)
	const hasChecked = useAuthStore(state => state.hasChecked)
	const error = useAuthStore(state => state.error)
	const user = useAuthStore(state => state.user)

	if (isLoading || !hasChecked || error !== null) return null

	if (props.forNonLoggedIn) {
		if (isLoggedIn) {
			if (user?.role === UserRole.Admin) {
				return <Navigate to='/admin' />
			} else {
				return <Navigate to='/' />
			}
		}

		return <Outlet />
	}

	if (!isLoggedIn || !user) return <Navigate to='/login' />

	return <Outlet />
}

export default AuthorizationOutlet
