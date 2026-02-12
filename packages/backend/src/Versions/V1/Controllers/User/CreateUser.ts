import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource, UserRole } from '@asset-management/common'
import z from 'zod/v4'

import UserService from 'Services/UserService'

import { InvalidStateError } from 'Errors'

class CreateUser extends Controller {
	constructor(private userService = DI.get(UserService)) {
		super('CreateUser')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<CreateUser>,
		response: CelosiaResponse,
	) {
		const { name, username, password, role } = request.body

		try {
			// TODO: Add created by in db field. Add disabled/enabled user.
			const user = await this.userService.create({
				name,
				username,
				password,
				role,
			})

			return response.status(200).json({
				errors: {},
				data: {
					id: user.id.toString(),
				},
			})
		} catch (error) {
			if (
				error instanceof InvalidStateError &&
				error.operation === 'create' &&
				error.state === 'userAlreadyExists'
			) {
				return response.status(409).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.Username,
								kind: ApiErrorKind.Taken,
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
			name: z.string().trim().min(1).max(100),
			username: z
				.string()
				.trim()
				.min(1)
				.max(50)
				.regex(/^(?!.*\s)/g, 'Must not contains white space.'),
			password: z
				.string()
				.min(8)
				.max(100)
				.regex(/^(?!.*\s)/g, 'Must not contains white space.'),
			role: z.enum(UserRole),
		})
	}
}

export default CreateUser
