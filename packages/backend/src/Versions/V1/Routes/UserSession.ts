import { CelosiaRouter } from '@celosiajs/core'

import { UserRole } from '@asset-management/common'

import HandleAccess from 'Middlewares/HandleAccess'
import VerifyJWT from 'Middlewares/VerifyJWT'

import HasRole from 'Services/AccessControl/ResourceAccessPolicies/HasRole'
import IsSameUser from 'Services/AccessControl/ResourceAccessPolicies/IsSameUser'
import IsSameUserBySession from 'Services/AccessControl/ResourceAccessPolicies/IsSameUserBySession'
import UserResourceContextGetter from 'Services/AccessControl/ResourceContextGetters/UserResourceContextGetter'
import UserSessionResourceContextGetter from 'Services/AccessControl/ResourceContextGetters/UserSessionResourceContextGetter'

import {
	FindManyUserSessions,
	FindUserSessionById,
	RevokeAllUserSessionsByUserId,
	RevokeUserSession,
} from '../Controllers/User/Session'

const UserSessionRouter = new CelosiaRouter({ strict: true })

UserSessionRouter.get(
	'/session/:id',
	[
		new VerifyJWT(false),
		new HandleAccess([new IsSameUserBySession()], new UserSessionResourceContextGetter()),
	],
	new FindUserSessionById(),
)
UserSessionRouter.delete(
	'/session/:id',
	[
		new VerifyJWT(false),
		new HandleAccess([new IsSameUserBySession()], new UserSessionResourceContextGetter()),
	],
	new RevokeUserSession(),
)
UserSessionRouter.delete(
	'/:id/session/',
	[new VerifyJWT(false), new HandleAccess([new IsSameUser()], new UserResourceContextGetter())],
	new RevokeAllUserSessionsByUserId(),
)
UserSessionRouter.get(
	'/session',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new FindManyUserSessions(),
)

export default UserSessionRouter
