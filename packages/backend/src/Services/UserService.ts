import { DI, Injectable, Service } from '@celosiajs/core'

import { SortOrder, UserRole, UserSortField } from '@asset-management/common'

import { DeepPartialAndUndefined } from 'Types/Types'

import RemoveKeyFromObjectImmutable from 'Utils/RemoveKeyFromObjectImmutable'
import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'
import UserRepository, { UserQueryAllOptions } from 'Repositories/UserRepository'

import PasswordHashService from 'Services/PasswordHashService'

import { InvalidStateError } from 'Errors'

import { Prisma } from 'PrismaGenerated/client'

import ConfigurationService from './ConfigurationService/ConfigurationService'
import { FindManyOptions } from './Types'

export interface User {
	id: bigint
	name: string
	username: string
	password: string
	createdAt: Date
	updatedAt: Date
}

export interface UserCreateData {
	name: string
	username: string
	password: string
	role: UserRole
}

export interface UserUpdateData {
	name: string
}

export interface UserFilterOptions {
	search?: string
}

export interface UserFindManyOptions extends FindManyOptions<UserSortField> {
	filter?: UserFilterOptions
}

export interface UserCountOptions {
	filter?: UserFilterOptions
}

@Injectable()
class UserService extends Service {
	constructor(
		private unitOfWork = DI.get(UnitOfWork),
		private passwordHashService = DI.get(PasswordHashService),
		private configurationService = DI.get(ConfigurationService),
	) {
		super('UserService')
	}

	private transformData(
		data: Prisma.UserGetPayload<{ select: UserService['dataSelect'] }>,
	): User {
		return {
			id: data.id,
			name: data.name,
			username: data.username,
			password: data.password,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
		}
	}

	private buildRepositoryFilterOptions(filter: UserFilterOptions) {
		const repositoryFilter: Prisma.UserWhereInput = {}

		if (filter.search !== undefined)
			repositoryFilter.OR = [
				{
					name: {
						contains: filter.search,
						mode: 'insensitive',
					},
				},
				{
					username: {
						contains: filter.search,
						mode: 'insensitive',
					},
				},
			]

		return repositoryFilter
	}

	private get dataSelect() {
		return {
			id: true,
			name: true,
			username: true,
			password: true,
			createdAt: true,
			updatedAt: true,
		} satisfies Prisma.UserSelect
	}

	async findById(id: bigint) {
		return await this.unitOfWork.execute(async transaction => {
			const result = await transaction.getRepository(UserRepository).findUnique({
				filter: { id },
				select: this.dataSelect,
			})

			if (result === null) return null

			return this.transformData(result)
		})
	}

	async findByUsername(username: string) {
		return await this.unitOfWork.execute(async transaction => {
			const result = await transaction
				.getRepository(UserRepository)
				.findUnique({ filter: { username }, select: this.dataSelect })

			if (result === null) return null

			return this.transformData(result)
		})
	}

	async findMany(options: UserFindManyOptions = {}) {
		const repositoryOptions: UserQueryAllOptions = {
			select: {
				id: true,
				username: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		}

		if (options.sort !== undefined) {
			repositoryOptions.sort = {
				[options.sort.field]: options.sort.order ?? SortOrder.Ascending,
			}
		}

		if (options.filter !== undefined) {
			repositoryOptions.filter = this.buildRepositoryFilterOptions(options.filter)
		}

		if (options.pagination !== undefined) {
			repositoryOptions.pagination = {
				limit: Math.min(
					options.pagination.limit ??
						this.configurationService.configurations.pagination.defaultLimit,
					this.configurationService.configurations.pagination.defaultMaxLimit,
				),
				page: options.pagination.page ?? 0,
			}
		}

		return await this.unitOfWork.execute(async transaction =>
			transaction.getRepository(UserRepository).findMany(repositoryOptions),
		)
	}

	async count(options: UserCountOptions): Promise<number> {
		const repositoryOptions: UserQueryAllOptions = {}

		if (options.filter !== undefined) {
			repositoryOptions.filter = this.buildRepositoryFilterOptions(options.filter)
		}

		return await this.unitOfWork.execute(async transaction =>
			transaction.getRepository(UserRepository).count(repositoryOptions),
		)
	}

	async list(options: UserFindManyOptions = {}) {
		return await this.unitOfWork.execute(async () => {
			const result = await this.findMany(options)
			const count = await this.count(options)

			return {
				pagination: {
					page: options.pagination?.page ?? 0,
					limit:
						options.pagination?.limit ??
						this.configurationService.configurations.pagination.defaultLimit,
					total: count,
				},
				list: result.map(user => ({
					id: user.id.toString(),
					username: user.username,
					name: user.name,
					createdAt: user.createdAt.getTime(),
					updatedAt: user.updatedAt.getTime(),
				})),
			}
		})
	}

	async create(data: UserCreateData) {
		return await this.unitOfWork.execute(async transaction => {
			const user = await this.findByUsername(data.username)

			if (user !== null) throw new InvalidStateError('create', 'userAlreadyExists')

			const passwordDigest = await this.passwordHashService.hash(data.password)

			const newData = RemoveKeyFromObjectImmutable(data, ['password'])

			return await transaction.getRepository(UserRepository).create({
				data: {
					...newData,
					password: passwordDigest,
				},
			})
		})
	}

	async updatePassword(id: bigint, newPassword: string) {
		const passworDigest = await this.passwordHashService.hash(newPassword)

		await this.unitOfWork.execute(async transaction =>
			transaction
				.getRepository(UserRepository)
				.update({ filter: { id }, data: { password: passworDigest } }),
		)
	}

	async update(id: bigint, data: DeepPartialAndUndefined<UserUpdateData>) {
		const updateData: Prisma.UserUpdateArgs['data'] = RemoveUndefinedValueFromObject(data)

		await this.unitOfWork.execute(async transaction => {
			await transaction
				.getRepository(UserRepository)
				.update({ filter: { id }, data: updateData })
		})
	}
}

export default UserService
