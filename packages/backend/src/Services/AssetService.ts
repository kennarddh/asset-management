import { DI, Injectable, Service } from '@celosiajs/core'

import { AssetSortField, AssetStatus, SortOrder } from '@asset-management/common'

import { DeepPartialAndUndefined } from 'Types/Types'

import RemoveKeyFromObjectImmutable from 'Utils/RemoveKeyFromObjectImmutable'
import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import AssetRepository, { AssetQueryAllOptions } from 'Repositories/AssetRepository'
import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import { InvalidStateError, ResourceNotFoundError } from 'Errors'

import { Prisma } from 'PrismaGenerated/client'

import ConfigurationService from './ConfigurationService/ConfigurationService'
import ImageProcessingService from './ImageProcessingService'
import S3Service from './S3Service'
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
	galleries: { id: bigint; key: string }[]
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
	galleries: Buffer[]
}

export interface AssetUpdateData {
	name: string
	description: string
	maximumLendingDuration: number
	minimumLendingDuration: number
	requiresApproval: boolean
	status: AssetStatus
	categoryId: bigint
	galleries: {
		newImages: Buffer[]
		existingIds: bigint[]
	}
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
		private s3Service = DI.get(S3Service),
		private imageProcessingService = DI.get(ImageProcessingService),
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
					key: true,
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
				galleries: { id: bigint; key: string }[]
			}>({
				filter: { id },
				select: this.dataSelect,
			})

			if (result === null) return null

			return this.transformData(result)
		})
	}

	async findByIdWithUrls(id: bigint) {
		const asset = await this.findById(id)

		if (asset === null) return null

		return {
			...asset,
			galleries: asset.galleries.map(gallery => ({
				id: gallery.id,
				url: this.s3Service.getPublicUrl(gallery.key, 'asset'),
			})),
		}
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
				galleries: { id: bigint; key: string }[]
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
						url: this.s3Service.getPublicUrl(gallery.key, 'asset'),
					})),
					createdAt: asset.createdAt.getTime(),
					updatedAt: asset.updatedAt.getTime(),
				})),
			}
		})
	}

	async create(data: AssetCreateData) {
		const newData = RemoveKeyFromObjectImmutable(data, ['galleries'])

		for (const imageBuffer of data.galleries) {
			const isValid = await this.imageProcessingService.isValidImage(imageBuffer)

			if (!isValid) {
				throw new InvalidStateError('create', 'imageInvalid')
			}
		}

		const promises = data.galleries.map(buffer => this.s3Service.uploadAssetImage(buffer))

		const uploadResults = await Promise.allSettled(promises)

		const keys = uploadResults
			.filter(result => result.status === 'fulfilled')
			.map(result => result.value)

		// TODO: By default it will just pick any succesful uploads and ignore failed one, but we might want to handle failed uploads better.
		if (keys.length === 0) {
			throw new InvalidStateError('create', 'imageUploadFailed')
		}

		return await this.unitOfWork.execute(async transaction => {
			return await transaction.getRepository(AssetRepository).create({
				data: {
					...newData,
					galleries: {
						createMany: {
							data: keys.map(key => ({ key })),
						},
					},
				},
			})
		})
	}

	async update(id: bigint, data: DeepPartialAndUndefined<AssetUpdateData, 'galleries'>) {
		const updateData: Prisma.AssetUpdateArgs['data'] = RemoveKeyFromObjectImmutable(
			RemoveUndefinedValueFromObject(data),
			['galleries'],
		)

		const galleries = data.galleries

		if (galleries !== undefined) {
			const currentAssetData = await this.findById(id)

			if (currentAssetData === null) throw new ResourceNotFoundError('asset')

			for (const imageBuffer of galleries.newImages) {
				const isValid = await this.imageProcessingService.isValidImage(imageBuffer)

				if (!isValid) {
					throw new InvalidStateError('update', 'imageInvalid')
				}
			}

			const galleriesToRemove = currentAssetData.galleries.filter(
				currentGallery => !galleries.existingIds.includes(currentGallery.id),
			)

			updateData.galleries = {}

			let keysCount = 0

			if (galleries.newImages.length > 0) {
				const promises = galleries.newImages.map(buffer =>
					this.s3Service.uploadAssetImage(buffer),
				)

				const uploadResults = await Promise.allSettled(promises)

				const keys = uploadResults
					.filter(result => result.status === 'fulfilled')
					.map(result => result.value)

				keysCount = keys.length

				updateData.galleries.createMany = {
					data: keys.map(key => ({ key })),
				}
			}

			if (galleriesToRemove.length > 0) {
				const promises = galleriesToRemove.map(async gallery => {
					await this.s3Service.deleteAssetImage(gallery.key)

					return gallery.id
				})

				const deleteResults = await Promise.allSettled(promises)

				const deletedIds = deleteResults
					.filter(result => result.status === 'fulfilled')
					.map(result => result.value)

				updateData.galleries.deleteMany = {
					id: { in: deletedIds },
				}

				if (keysCount + galleries.existingIds.length === 0) {
					throw new InvalidStateError('update', 'mustHaveAtLeastOneImage')
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
