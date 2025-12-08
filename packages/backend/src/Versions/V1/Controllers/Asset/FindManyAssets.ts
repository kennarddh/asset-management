import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { AssetSortField, AssetStatus, SortOrder } from '@asset-management/common'
import z from 'zod/v4'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import AssetService, { AssetFindManyOptions } from 'Services/AssetService'

import ZodPagination from 'Validations/Zod/ZodPagination'

class FindManyAssets extends Controller {
	constructor(private assetService = DI.get(AssetService)) {
		super('FindManyAssets')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<FindManyAssets>,
		response: CelosiaResponse,
	) {
		const { search, categoryId, status, pagination, sort } = request.query

		const options = RemoveUndefinedValueFromObject({
			filter: { search, categoryId, status },
			pagination,
			sort,
		}) satisfies AssetFindManyOptions

		try {
			const data = await this.assetService.list(options)

			return response.status(200).json({
				errors: {},
				data,
			})
		} catch (error) {
			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get query() {
		return z.object({
			search: z.string().optional(),
			categoryId: z.coerce.bigint().min(1n).optional(),
			status: z.enum(AssetStatus).array().optional(),
			pagination: ZodPagination.optional(),
			sort: z
				.object({
					field: z.enum(AssetSortField),
					order: z.enum(SortOrder).optional(),
				})
				.optional(),
		})
	}
}

export default FindManyAssets
