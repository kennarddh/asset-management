import { CelosiaRouter } from '@celosiajs/core'

import AuthRouter from './Auth'
import UserRouter from './User'

const V1Router = new CelosiaRouter({ strict: true })

V1Router.useRouters('/auth', AuthRouter)
V1Router.useRouters('/user', UserRouter)

export default V1Router
