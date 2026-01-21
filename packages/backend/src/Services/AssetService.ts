import { DI, Injectable, Service } from '@celosiajs/core'

import { AssetSortField, AssetStatus, SortOrder } from '@asset-management/common'

import { DeepPartialAndUndefined } from 'Types/Types'

import RemoveKeyFromObjectImmutable from 'Utils/RemoveKeyFromObjectImmutable'
import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import AssetRepository, { AssetQueryAllOptions } from 'Repositories/AssetRepository'
import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import { ResourceNotFoundError } from 'Errors'

import { Prisma } from 'PrismaGenerated/client'

import ConfigurationService from './ConfigurationService/ConfigurationService'
import { FindManyOptions } from './Types'

export interface Asset {
	id: bigint
	name: string
	description: string
	maximumLendingDuration: number
	minimumLendingDuration: number
	requiresApproval: boolean
	status: AssetStatus
	category: { id: bigint; name: string }
	galleries: { id: bigint; url: string }[]
	createdAt: Date
	updatedAt: Date
}

export interface AssetCreateData {
	name: string
	description: string
	maximumLendingDuration: number
	minimumLendingDuration: number
	requiresApproval: boolean
	status: AssetStatus
	categoryId: bigint
	galleries: { url: string }[]
}

export interface AssetUpdateData {
	name: string
	description: string
	maximumLendingDuration: number
	minimumLendingDuration: number
	requiresApproval: boolean
	status: AssetStatus
	categoryId: bigint
	galleries: { url: string }[]
}

export interface AssetFilterOptions {
	search?: string
	categoryId?: bigint
	status?: AssetStatus[]
}

export interface AssetFindManyOptions extends FindManyOptions<AssetSortField> {
	filter?: AssetFilterOptions
}

export interface AssetCountOptions {
	filter?: AssetFilterOptions
}

@Injectable()
class AssetService extends Service {
	constructor(
		private unitOfWork = DI.get(UnitOfWork),
		private configurationService = DI.get(ConfigurationService),
	) {
		super('AssetService')
	}

	private transformData(
		data: Prisma.AssetGetPayload<{ select: AssetService['dataSelect'] }>,
	): Asset {
		return {
			id: data.id,
			name: data.name,
			description: data.description,
			category: { id: data.category.id, name: data.category.name },
			maximumLendingDuration: data.maximumLendingDuration,
			minimumLendingDuration: data.minimumLendingDuration,
			requiresApproval: data.requiresApproval,
			status: data.status as AssetStatus,
			galleries: data.galleries,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
		}
	}

	private buildRepositoryFilterOptions(filter: AssetFilterOptions) {
		const repositoryFilter: Prisma.AssetWhereInput = {}

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

		if (filter.categoryId !== undefined) repositoryFilter.categoryId = filter.categoryId

		if (filter.status !== undefined) repositoryFilter.status = { in: filter.status }

		return repositoryFilter
	}

	private get dataSelect() {
		return {
			id: true,
			name: true,
			description: true,
			category: { select: { id: true, name: true } },
			maximumLendingDuration: true,
			minimumLendingDuration: true,
			requiresApproval: true,
			status: true,
			galleries: {
				select: {
					id: true,
					url: true,
				},
			},
			createdAt: true,
			updatedAt: true,
		} satisfies Prisma.AssetSelect
	}

	async findById(id: bigint) {
		return await this.unitOfWork.execute(async transaction => {
			const result = await transaction.getRepository(AssetRepository).findUnique<{
				category: { id: bigint; name: string }
				galleries: { id: bigint; url: string }[]
			}>({
				filter: { id },
				select: this.dataSelect,
			})

			if (result === null) return null

			return this.transformData(result)
		})
	}

	async findMany(options: AssetFindManyOptions = {}) {
		const repositoryOptions: AssetQueryAllOptions = {
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
			transaction.getRepository(AssetRepository).findMany<{
				category: { id: bigint; name: string }
				galleries: { id: bigint; url: string }[]
			}>(repositoryOptions),
		)
	}

	async count(options: AssetCountOptions): Promise<number> {
		const repositoryOptions: AssetQueryAllOptions = {}

		if (options.filter !== undefined) {
			repositoryOptions.filter = this.buildRepositoryFilterOptions(options.filter)
		}

		return await this.unitOfWork.execute(async transaction =>
			transaction.getRepository(AssetRepository).count(repositoryOptions),
		)
	}

	async list(options: AssetFindManyOptions = {}) {
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
				list: result.map(asset => ({
					id: asset.id.toString(),
					name: asset.name,
					description: asset.description,
					category: { id: asset.category.id.toString(), name: asset.category.name },
					maximumLendingDuration: asset.maximumLendingDuration,
					minimumLendingDuration: asset.minimumLendingDuration,
					requiresApproval: asset.requiresApproval,
					status: asset.status as AssetStatus,
					galleries: asset.galleries.map(gallery => ({
						id: gallery.id.toString(),
						url: gallery.url,
					})),
					createdAt: asset.createdAt.getTime(),
					updatedAt: asset.updatedAt.getTime(),
				})),
			}
		})
	}

	async create(data: AssetCreateData) {
		return await this.unitOfWork.execute(async transaction => {
			const newData = RemoveKeyFromObjectImmutable(data, ['galleries'])

			return await transaction.getRepository(AssetRepository).create({
				data: {
					...newData,
					galleries: {
						createMany: {
							// TODO: Validate gallery URLs
							data: data.galleries.map(gallery => ({ url: gallery.url })),
						},
					},
				},
			})
		})
	}

	async update(id: bigint, data: DeepPartialAndUndefined<AssetUpdateData>) {
		const updateData: Prisma.AssetUpdateArgs['data'] = RemoveKeyFromObjectImmutable(
			RemoveUndefinedValueFromObject(data),
			['galleries'],
		)

		const galleries = data.galleries

		// TODO: Check for quantity validity before updating it. If it is lowered then there must be enough to fulfill all approved orders.

		if (galleries !== undefined) {
			const currentAssetData = await this.findById(id)

			if (currentAssetData === null) throw new ResourceNotFoundError('asset')

			const galleriesToAdd = galleries.filter(
				gallery =>
					!currentAssetData.galleries.some(
						currentGallery => currentGallery.url === gallery.url,
					),
			)

			const galleriesToRemove = currentAssetData.galleries.filter(
				currentGallery => !galleries.some(gallery => gallery.url === currentGallery.url),
			)

			updateData.galleries = {}

			if (galleriesToAdd.length > 0) {
				updateData.galleries.createMany = {
					// TODO: Validate gallery URLs
					data: galleriesToAdd.map(gallery => ({ url: gallery.url })),
				}
			}

			if (galleriesToRemove.length > 0) {
				updateData.galleries.deleteMany = {
					id: { in: galleriesToRemove.map(gallery => gallery.id) },
				}
			}
		}

		await this.unitOfWork.execute(async transaction => {
			await transaction
				.getRepository(AssetRepository)
				.update({ filter: { id }, data: updateData })
		})
	}
}

export default AssetService
