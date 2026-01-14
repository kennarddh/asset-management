import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { AssetStatus } from '@asset-management/common'
import z from 'zod/v4'

import AssetService from 'Services/AssetService'

class CreateAsset extends Controller {
	constructor(private assetService = DI.get(AssetService)) {
		super('CreateAsset')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<CreateAsset>,
		response: CelosiaResponse,
	) {
		const {
			name,
			description,
			quantity,
			maximumLendingDuration,
			minimumLendingDuration,
			requiresApproval,
			status,
			categoryId,
			galleries,
		} = request.body

		try {
			const asset = await this.assetService.create({
				name,
				description,
				quantity,
				maximumLendingDuration,
				minimumLendingDuration,
				requiresApproval,
				status,
				categoryId,
				galleries,
			})

			return response.status(200).json({
				errors: {},
				data: {
					id: asset.id.toString(),
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
			quantity: z.int().min(1),
			maximumLendingDuration: z.int().min(1),
			minimumLendingDuration: z.int().min(1),
			requiresApproval: z.boolean(),
			status: z.enum(AssetStatus),
			categoryId: z.coerce.bigint().min(1n),
			galleries: z
				.array(
					z.object({
						url: z.url(),
					}),
				)
				.min(1),
		})
	}
}

export default CreateAsset
