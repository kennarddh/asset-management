import { CelosiaRouter } from '@celosiajs/core'

import AssetRouter from './Asset'
import AuthRouter from './Auth'
import OrderRouter from './Order'
import UserRouter from './User'

const V1Router = new CelosiaRouter({ strict: true })

V1Router.useRouters('/auth', AuthRouter)
V1Router.useRouters('/user', UserRouter)
V1Router.useRouters('/asset', AssetRouter)
V1Router.useRouters('/order', OrderRouter)

export default V1Router
