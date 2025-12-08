import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import z from 'zod/v4'

import AssetCategoryService from 'Services/AssetCategoryService'

class FindAssetCategoryById extends Controller {
	constructor(private assetCategoryService = DI.get(AssetCategoryService)) {
		super('FindAssetCategoryById')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<FindAssetCategoryById>,
		response: CelosiaResponse,
	) {
		const { id } = request.params

		try {
			const assetCategory = await this.assetCategoryService.findById(id)

			if (!assetCategory)
				return response.status(404).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.AssetCategory,
								kind: ApiErrorKind.NotFound,
							},
						],
					},
					data: {},
				})

			return response.status(200).json({
				errors: {},
				data: {
					id: assetCategory.id.toString(),
					name: assetCategory.name,
					description: assetCategory.description,
					createdAt: assetCategory.createdAt.getTime(),
					updatedAt: assetCategory.updatedAt.getTime(),
				},
			})
		} catch (error) {
			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.bigint().min(1n),
		})
	}
}

export default FindAssetCategoryById
