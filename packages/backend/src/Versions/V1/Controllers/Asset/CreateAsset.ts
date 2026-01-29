import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'
import { ZodUploadedFileType } from '@celosiajs/file-upload'

import { ApiErrorKind, ApiErrorResource, AssetStatus } from '@asset-management/common'
import z from 'zod/v4'

import AssetService from 'Services/AssetService'

import { InvalidStateError } from 'Errors'

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
				maximumLendingDuration,
				minimumLendingDuration,
				requiresApproval,
				status,
				categoryId,
				galleries: galleries.map(image => image.buffer),
			})

			return response.status(200).json({
				errors: {},
				data: {
					id: asset.id.toString(),
				},
			})
		} catch (error) {
			if (error instanceof InvalidStateError) {
				if (error.operation === 'create' && error.state === 'imageUploadFailed') {
					return response.status(409).json({
						errors: {
							others: [
								{
									resource: ApiErrorResource.Image,
									kind: ApiErrorKind.UploadFailed,
								},
							],
						},
						data: {},
					})
				}
			}

			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			name: z.string().trim().min(1).max(100),
			description: z.string().trim(),
			maximumLendingDuration: z.coerce.number().int().min(1),
			minimumLendingDuration: z.coerce.number().int().min(1),
			requiresApproval: z.coerce.boolean(),
			status: z.enum(AssetStatus),
			categoryId: z.coerce.bigint().min(1n),
			galleries: z.array(ZodUploadedFileType).min(1),
		})
	}
}

export default CreateAsset
