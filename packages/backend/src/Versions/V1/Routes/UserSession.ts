import { CelosiaRouter } from '@celosiajs/core'

import VerifyJWT from 'Middlewares/VerifyJWT'

import {
	FindManyUserSessions,
	FindUserSessionById,
	RevokeAllUserSessionsByUserId,
	RevokeUserSession,
} from '../Controllers/User/Session'

const UserSessionRouter = new CelosiaRouter({ strict: true })

UserSessionRouter.get('/session/:id', [new VerifyJWT(false)], new FindUserSessionById())
UserSessionRouter.delete('/session/:id', [new VerifyJWT(false)], new RevokeUserSession())
UserSessionRouter.delete(
	'/:id/session/',
	[new VerifyJWT(false)],
	new RevokeAllUserSessionsByUserId(),
)
UserSessionRouter.get('/session', [new VerifyJWT(false)], new FindManyUserSessions())

export default UserSessionRouter
