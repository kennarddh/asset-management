import { CelosiaRouter } from '@celosiajs/core'

import VerifyJWT from 'Middlewares/VerifyJWT'

import {
	CountNotifications,
	FindManyNotifications,
	ReadAllNotifications,
} from '../Controllers/Notification'

const NotificationRouter = new CelosiaRouter({ strict: true })

NotificationRouter.get('/', [new VerifyJWT(false)], new FindManyNotifications())
NotificationRouter.get('/count', [new VerifyJWT(false)], new CountNotifications())
NotificationRouter.post('/read-all', [new VerifyJWT(false)], new ReadAllNotifications())

export default NotificationRouter
