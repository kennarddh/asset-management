import { CelosiaRouter } from '@celosiajs/core'

import { UserRole } from '@asset-management/common'

import HandleAccess from 'Middlewares/HandleAccess'
import VerifyJWT from 'Middlewares/VerifyJWT'

import HasRole from 'Services/AccessControl/ResourceAccessPolicies/HasRole'
import IsCreatorOfOrder from 'Services/AccessControl/ResourceAccessPolicies/IsCreatorOfOrder'
import { And, Or } from 'Services/AccessControl/ResourceAccessPoliciesBoolean'
import OrderResourceContextGetter from 'Services/AccessControl/ResourceContextGetters/OrderResourceContextGetter'

import {
	ApproveOrder,
	CancelOrder,
	CreateOrder,
	FindManyOrders,
	FindManySelfOrders,
	FindOrderById,
	RejectOrder,
	ReturnOrder,
} from '../Controllers/Order'

const OrderRouter = new CelosiaRouter({ strict: true })

OrderRouter.get(
	'/',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new FindManyOrders(),
)
OrderRouter.get(
	'/self',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Member)])],
	new FindManySelfOrders(),
)
OrderRouter.get(
	'/:id',
	[
		new VerifyJWT(false),
		new HandleAccess(
			[
				new Or(
					new And(new HasRole(UserRole.Member), new IsCreatorOfOrder()),
					new HasRole(UserRole.Admin),
				),
			],
			new OrderResourceContextGetter(),
		),
	],
	new FindOrderById(),
)

OrderRouter.post(
	'/',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Member)])],
	new CreateOrder(),
)

OrderRouter.post(
	'/:id/approve',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new ApproveOrder(),
)
OrderRouter.post(
	'/:id/reject',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new RejectOrder(),
)
OrderRouter.post(
	'/:id/cancel',
	[
		new VerifyJWT(false),
		new HandleAccess(
			[new HasRole(UserRole.Member), new IsCreatorOfOrder()],
			new OrderResourceContextGetter(),
		),
	],
	new CancelOrder(),
)
OrderRouter.post(
	'/:id/return',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new ReturnOrder(),
)

export default OrderRouter
