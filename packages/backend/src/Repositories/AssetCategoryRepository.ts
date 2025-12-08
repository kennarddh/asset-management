import { UnpackArray } from 'Types/Types'

import { Prisma } from 'PrismaGenerated/client'

import { DataAccessError } from '../Errors'
import PrismaRepository from './PrismaRepository'
import { PaginationOptions } from './Types'

export interface AssetCategoryQueryOptions {
	select?: Prisma.AssetCategorySelect
}

export interface AssetCategoryQueryUniqueOptions extends AssetCategoryQueryOptions {
	filter: Prisma.AssetCategoryWhereUniqueInput
}

export interface AssetCategoryQueryAllOptions extends AssetCategoryQueryOptions {
	filter?: Prisma.AssetCategoryWhereInput
	sort?:
		| Prisma.AssetCategoryOrderByWithRelationInput
		| Prisma.AssetCategoryOrderByWithRelationInput[]
	pagination?: PaginationOptions
}

export interface AssetCategoryCountOptions {
	filter?: Prisma.AssetCategoryWhereInput
	sort?:
		| Prisma.AssetCategoryOrderByWithRelationInput
		| Prisma.AssetCategoryOrderByWithRelationInput[]
}

export interface AssetCategoryUpdateOptions {
	filter: Prisma.AssetCategoryWhereUniqueInput
	data: Prisma.AssetCategoryUpdateArgs['data']
}

export interface AssetCategoryCreateOptions extends AssetCategoryQueryOptions {
	data: Prisma.AssetCategoryCreateArgs['data']
}

class AssetCategoryRepository extends PrismaRepository {
	constructor(prisma: Prisma.TransactionClient) {
		super('AssetCategoryRepository', prisma)
	}

	async findUnique<T = unknown>(options: AssetCategoryQueryUniqueOptions) {
		try {
			const result = await this.prisma.assetCategory.findUnique({
				where: options.filter,
				...(options.select !== undefined ? { select: options.select } : {}),
			})

			return result as (typeof result & T) | null
		} catch (error) {
			this.logger.error('Find unique.', error)

			throw new DataAccessError()
		}
	}

	async findMany<T = unknown>(options: AssetCategoryQueryAllOptions = {}) {
		const pagination = this.buildPrismaPagination(options.pagination)

		try {
			const result = await this.prisma.assetCategory.findMany({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
				...(options.select !== undefined ? { select: options.select } : {}),
				...(pagination !== undefined ? { skip: pagination.skip } : {}),
				...(pagination !== undefined ? { take: pagination.take } : {}),
			})

			return result as (UnpackArray<typeof result> & T)[]
		} catch (error) {
			this.logger.error('Find many.', error)

			throw new DataAccessError()
		}
	}

	async count(options: AssetCategoryCountOptions): Promise<number> {
		try {
			return await this.prisma.assetCategory.count({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
			})
		} catch (error) {
			this.logger.error('Count.', error)

			throw new DataAccessError()
		}
	}

	async create(options: AssetCategoryCreateOptions) {
		try {
			return await this.prisma.assetCategory.create({
				data: options.data,
				...(options.select !== undefined ? { select: options.select } : {}),
			})
		} catch (error) {
			this.logger.error('Create.', error)

			throw new DataAccessError()
		}
	}

	async update(options: AssetCategoryUpdateOptions) {
		try {
			await this.prisma.assetCategory.update({
				data: options.data,
				where: options.filter,
				select: { id: true },
			})
		} catch (error) {
			this.logger.error('Update.', error)

			throw new DataAccessError()
		}
	}
}

export default AssetCategoryRepository
