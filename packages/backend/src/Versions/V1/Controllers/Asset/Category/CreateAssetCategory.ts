import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import z from 'zod/v4'

import AssetCategoryService from 'Services/AssetCategoryService'

class CreateAssetCategory extends Controller {
	constructor(private assetCategoryService = DI.get(AssetCategoryService)) {
		super('CreateAssetCategory')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<CreateAssetCategory>,
		response: CelosiaResponse,
	) {
		const { name, description } = request.body

		try {
			const assetCategory = await this.assetCategoryService.create({
				name,
				description,
			})

			return response.status(200).json({
				errors: {},
				data: {
					id: assetCategory.id.toString(),
				},
			})
		} catch (error) {
			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			name: z.string().trim().min(1).max(100),
			description: z.string().trim(),
		})
	}
}

export default CreateAssetCategory
