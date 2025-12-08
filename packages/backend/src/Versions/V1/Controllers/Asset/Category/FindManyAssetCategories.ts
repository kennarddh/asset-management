import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { AssetCategorySortField, SortOrder } from '@asset-management/common'
import z from 'zod/v4'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import AssetCategoryService, { AssetCategoryFindManyOptions } from 'Services/AssetCategoryService'

import ZodPagination from 'Validations/Zod/ZodPagination'

class FindManyAssetCategories extends Controller {
	constructor(private assetCategoryService = DI.get(AssetCategoryService)) {
		super('FindManyAssetCategories')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<FindManyAssetCategories>,
		response: CelosiaResponse,
	) {
		const { search, pagination, sort } = request.query

		const options = RemoveUndefinedValueFromObject({
			filter: { search },
			pagination,
			sort,
		}) satisfies AssetCategoryFindManyOptions

		try {
			const data = await this.assetCategoryService.list(options)

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
			pagination: ZodPagination.optional(),
			sort: z
				.object({
					field: z.enum(AssetCategorySortField),
					order: z.enum(SortOrder).optional(),
				})
				.optional(),
		})
	}
}

export default FindManyAssetCategories
