import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource, AssetStatus } from '@asset-management/common'
import z from 'zod/v4'

import AssetService from 'Services/AssetService'

import { ResourceNotFoundError } from 'Errors'

class UpdateAsset extends Controller {
	constructor(private assetService = DI.get(AssetService)) {
		super('UpdateAsset')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<UpdateAsset>,
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
		const { id } = request.params

		try {
			await this.assetService.update(id, {
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

			return response.sendStatus(204)
		} catch (error) {
			if (error instanceof ResourceNotFoundError) {
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
			}

			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			name: z.string().trim().min(1).max(100).optional(),
			description: z.string().trim().optional(),
			quantity: z.int().min(1).optional(),
			maximumLendingDuration: z.int().min(1).optional(),
			minimumLendingDuration: z.int().min(1),
			requiresApproval: z.boolean().optional(),
			status: z.enum(AssetStatus).optional(),
			categoryId: z.coerce.bigint().min(1n).optional(),
			galleries: z
				.array(
					z.object({
						url: z.url(),
					}),
				)
				.min(1)
				.optional(),
		})
	}

	public override get params() {
		return z.object({
			id: z.coerce.bigint().min(1n),
		})
	}
}

export default UpdateAsset
