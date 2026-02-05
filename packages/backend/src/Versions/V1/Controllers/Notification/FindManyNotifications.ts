import { CelosiaResponse, Controller, ControllerRequest, DI } from '@celosiajs/core'

import { NotificationSortField, SortOrder } from '@asset-management/common'
import z from 'zod/v4'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import NotificationService, { NotificationFindManyOptions } from 'Services/NotificationService'

import ZodPagination from 'Validations/Zod/ZodPagination'

class FindManyNotifications extends Controller {
	constructor(private notificationService = DI.get(NotificationService)) {
		super('FindManyNotifications')
	}

	public async index(
		data: JWTVerifiedData,
		request: ControllerRequest<FindManyNotifications>,
		response: CelosiaResponse,
	) {
		const { isRead, pagination, sort } = request.query

		const options = RemoveUndefinedValueFromObject({
			filter: { isRead, userId: data.user.session.user.id },
			pagination,
			sort,
		}) satisfies NotificationFindManyOptions

		try {
			const data = await this.notificationService.list(options)

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
			isRead: z.coerce.boolean().optional(),
			pagination: ZodPagination.optional(),
			sort: z
				.object({
					field: z.enum(NotificationSortField),
					order: z.enum(SortOrder).optional(),
				})
				.optional(),
		})
	}
}

export default FindManyNotifications
