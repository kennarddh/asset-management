import { CelosiaRouter } from '@celosiajs/core'

import { UserRole } from '@asset-management/common'

import HandleAccess from 'Middlewares/HandleAccess'
import VerifyJWT from 'Middlewares/VerifyJWT'

import HasRole from 'Services/AccessControl/ResourceAccessPolicies/HasRole'

import {
	CreateAssetCategory,
	FindAssetCategoryById,
	FindManyAssetCategories,
	UpdateAssetCategory,
} from '../Controllers/Asset/Category'

const AssetCategoryRouter = new CelosiaRouter({ strict: true })

AssetCategoryRouter.get('/', [new VerifyJWT(false)], new FindManyAssetCategories())
AssetCategoryRouter.post(
	'/',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new CreateAssetCategory(),
)
AssetCategoryRouter.get('/:id', [new VerifyJWT(false)], new FindAssetCategoryById())
AssetCategoryRouter.patch(
	'/:id',
	[new VerifyJWT(false), new HandleAccess([new HasRole(UserRole.Admin)])],
	new UpdateAssetCategory(),
)

export default AssetCategoryRouter
