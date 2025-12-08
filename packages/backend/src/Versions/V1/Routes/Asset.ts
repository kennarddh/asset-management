import { CelosiaRouter } from '@celosiajs/core'

import { UserRole } from '@asset-management/common'

import HandleAccess from 'Middlewares/HandleAccess'
import VerifyJWT from 'Middlewares/VerifyJWT'

import HasRole from 'Services/AccessControl/ResourceAccessPolicies/HasRole'

import { CreateAsset, FindAssetById, FindManyAssets, UpdateAsset } from '../Controllers/Asset'
import AssetCategoryRouter from './AssetCategory'

const AssetRouter = new CelosiaRouter({ strict: true })

AssetRouter.useRouters('/category/', AssetCategoryRouter)

AssetRouter.get('/', [new VerifyJWT(false)], new FindManyAssets())
AssetRouter.post(
	'/',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new CreateAsset(),
)
AssetRouter.get('/:id', [new VerifyJWT(false)], new FindAssetById())
AssetRouter.patch(
	'/:id',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new UpdateAsset(),
)

export default AssetRouter
