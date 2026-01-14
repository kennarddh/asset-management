import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import z from 'zod/v4'

import AssetService from 'Services/AssetService'

class FindAssetById extends Controller {
	constructor(private assetService = DI.get(AssetService)) {
		super('FindAssetById')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<FindAssetById>,
		response: CelosiaResponse,
	) {
		const { id } = request.params

		try {
			const asset = await this.assetService.findById(id)

			if (!asset)
				return response.status(404).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.Asset,
								kind: ApiErrorKind.NotFound,
							},
						],
					},
					data: {},
				})

			return response.status(200).json({
				errors: {},
				data: {
					id: asset.id.toString(),
					name: asset.name,
					description: asset.description,
					category: {
						id: asset.category.id.toString(),
						name: asset.category.name,
					},
					status: asset.status,
					quantity: asset.quantity,
					quantityCommited: asset.quantityCommited,
					quantityActive: asset.quantityActive,
					requiresApproval: asset.requiresApproval,
					maximumLendingDuration: asset.maximumLendingDuration,
					minimumLendingDuration: asset.minimumLendingDuration,
					galleries: asset.galleries.map(gallery => ({
						id: gallery.id.toString(),
						url: gallery.url,
					})),
					createdAt: asset.createdAt.getTime(),
					updatedAt: asset.updatedAt.getTime(),
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

export default FindAssetById
