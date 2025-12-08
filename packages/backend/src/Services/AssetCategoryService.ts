import { DI, Injectable, Service } from '@celosiajs/core'

import { AssetCategorySortField, SortOrder } from '@asset-management/common'

import { DeepPartialAndUndefined } from 'Types/Types'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import AssetCategoryRepository, {
	AssetCategoryQueryAllOptions,
} from 'Repositories/AssetCategoryRepository'
import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import { Prisma } from 'PrismaGenerated/client'

import ConfigurationService from './ConfigurationService/ConfigurationService'
import { FindManyOptions } from './Types'

export interface AssetCategory {
	id: bigint
	name: string
	description: string
	createdAt: Date
	updatedAt: Date
}

export interface AssetCategoryCreateData {
	name: string
	description: string
}

export interface AssetCategoryUpdateData {
	name: string
	description: string
}

export interface AssetCategoryFilterOptions {
	search?: string
}

export interface AssetCategoryFindManyOptions extends FindManyOptions<AssetCategorySortField> {
	filter?: AssetCategoryFilterOptions
}

export interface AssetCategoryCountOptions {
	filter?: AssetCategoryFilterOptions
}

@Injectable()
class AssetCategoryService extends Service {
	constructor(
		private unitOfWork = DI.get(UnitOfWork),
		private configurationService = DI.get(ConfigurationService),
	) {
		super('AssetCategoryService')
	}

	private transformData(
		data: Prisma.AssetCategoryGetPayload<{ select: AssetCategoryService['dataSelect'] }>,
	): AssetCategory {
		return {
			id: data.id,
			name: data.name,
			description: data.description,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
		}
	}

	private buildRepositoryFilterOptions(filter: AssetCategoryFilterOptions) {
		const repositoryFilter: Prisma.AssetCategoryWhereInput = {}

		if (filter.search !== undefined)
			repositoryFilter.OR = [
				{
					name: {
						contains: filter.search,
						mode: 'insensitive',
					},
				},
				{
					description: {
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
			description: true,
			createdAt: true,
			updatedAt: true,
		} satisfies Prisma.AssetCategorySelect
	}

	async findById(id: bigint) {
		return await this.unitOfWork.execute(async transaction => {
			const result = await transaction.getRepository(AssetCategoryRepository).findUnique({
				filter: { id },
				select: this.dataSelect,
			})

			if (result === null) return null

			return this.transformData(result)
		})
	}

	async findMany(options: AssetCategoryFindManyOptions = {}) {
		const repositoryOptions: AssetCategoryQueryAllOptions = {
			select: this.dataSelect,
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
			transaction.getRepository(AssetCategoryRepository).findMany(repositoryOptions),
		)
	}

	async count(options: AssetCategoryCountOptions): Promise<number> {
		const repositoryOptions: AssetCategoryQueryAllOptions = {}

		if (options.filter !== undefined) {
			repositoryOptions.filter = this.buildRepositoryFilterOptions(options.filter)
		}

		return await this.unitOfWork.execute(async transaction =>
			transaction.getRepository(AssetCategoryRepository).count(repositoryOptions),
		)
	}

	async list(options: AssetCategoryFindManyOptions = {}) {
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
				list: result.map(assetCategory => ({
					id: assetCategory.id.toString(),
					name: assetCategory.name,
					description: assetCategory.description,
					createdAt: assetCategory.createdAt.getTime(),
					updatedAt: assetCategory.updatedAt.getTime(),
				})),
			}
		})
	}

	async create(data: AssetCategoryCreateData) {
		return await this.unitOfWork.execute(async transaction => {
			return await transaction.getRepository(AssetCategoryRepository).create({
				data,
			})
		})
	}

	async update(id: bigint, data: DeepPartialAndUndefined<AssetCategoryUpdateData>) {
		const updateData: Prisma.AssetCategoryUpdateArgs['data'] =
			RemoveUndefinedValueFromObject(data)

		await this.unitOfWork.execute(async transaction => {
			await transaction
				.getRepository(AssetCategoryRepository)
				.update({ filter: { id }, data: updateData })
		})
	}
}

export default AssetCategoryService
