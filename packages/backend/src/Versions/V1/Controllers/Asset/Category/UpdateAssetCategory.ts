import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import z from 'zod/v4'

import AssetCategoryService from 'Services/AssetCategoryService'

import { ResourceNotFoundError } from 'Errors'

class UpdateAssetCategory extends Controller {
	constructor(private assetCategoryService = DI.get(AssetCategoryService)) {
		super('UpdateAssetCategory')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<UpdateAssetCategory>,
		response: CelosiaResponse,
	) {
		const { name, description } = request.body
		const { id } = request.params

		try {
			await this.assetCategoryService.update(id, {
				name,
				description,
			})

			return response.sendStatus(204)
		} catch (error) {
			if (error instanceof ResourceNotFoundError) {
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
			}

			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			name: z.string().trim().min(1).max(100).optional(),
			description: z.string().trim().optional(),
		})
	}

	public override get params() {
		return z.object({
			id: z.coerce.bigint().min(1n),
		})
	}
}

export default UpdateAssetCategory
