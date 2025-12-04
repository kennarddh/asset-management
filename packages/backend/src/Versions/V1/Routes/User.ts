import { CelosiaRouter } from '@celosiajs/core'

import VerifyJWT from 'Middlewares/VerifyJWT'

import { FindManyUsers, FindUserById, UpdateUser } from '../Controllers/User'
import UserSessionRouter from './UserSession'

const UserRouter = new CelosiaRouter({ strict: true })

UserRouter.useRouters('/', UserSessionRouter)

UserRouter.get('/', [new VerifyJWT(false)], new FindManyUsers())
UserRouter.patch('/:id', [new VerifyJWT(false)], new UpdateUser())
UserRouter.get('/:id', [new VerifyJWT(false)], new FindUserById())

export default UserRouter
