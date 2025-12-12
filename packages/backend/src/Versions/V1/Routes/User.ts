import { CelosiaRouter } from '@celosiajs/core'

import { UserRole } from '@asset-management/common'

import HandleAccess from 'Middlewares/HandleAccess'
import VerifyJWT from 'Middlewares/VerifyJWT'

import HasRole from 'Services/AccessControl/ResourceAccessPolicies/HasRole'
import IsSameUser from 'Services/AccessControl/ResourceAccessPolicies/IsSameUser'
import { Or } from 'Services/AccessControl/ResourceAccessPoliciesBoolean'
import UserResourceContextGetter from 'Services/AccessControl/ResourceContextGetters/UserResourceContextGetter'

import { FindManyUsers, FindUserById, UpdateUser } from '../Controllers/User'
import UserSessionRouter from './UserSession'

const UserRouter = new CelosiaRouter({ strict: true })

UserRouter.useRouters('/', UserSessionRouter)

UserRouter.get(
	'/',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new FindManyUsers(),
)
UserRouter.patch(
	'/:id',
	[new VerifyJWT(false), new HandleAccess([new IsSameUser()], new UserResourceContextGetter())],
	new UpdateUser(),
)
UserRouter.get(
	'/:id',
	[
		new VerifyJWT(false),
		new HandleAccess(
			[new Or(new IsSameUser(), new HasRole(UserRole.Admin))],
			new UserResourceContextGetter(),
		),
	],
	new FindUserById(),
)

export default UserRouter
