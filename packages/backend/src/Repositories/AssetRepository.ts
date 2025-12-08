import { UnpackArray } from 'Types/Types'

import { Prisma } from 'PrismaGenerated/client'

import { DataAccessError } from '../Errors'
import PrismaRepository from './PrismaRepository'
import { PaginationOptions } from './Types'

export interface AssetQueryOptions {
	select?: Prisma.AssetSelect
}

export interface AssetQueryUniqueOptions extends AssetQueryOptions {
	filter: Prisma.AssetWhereUniqueInput
}

export interface AssetQueryAllOptions extends AssetQueryOptions {
	filter?: Prisma.AssetWhereInput
	sort?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[]
	pagination?: PaginationOptions
}

export interface AssetCountOptions {
	filter?: Prisma.AssetWhereInput
	sort?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[]
}

export interface AssetUpdateOptions {
	filter: Prisma.AssetWhereUniqueInput
	data: Prisma.AssetUpdateArgs['data']
}

export interface AssetCreateOptions extends AssetQueryOptions {
	data: Prisma.AssetCreateArgs['data']
}

class AssetRepository extends PrismaRepository {
	constructor(prisma: Prisma.TransactionClient) {
		super('AssetRepository', prisma)
	}

	async findUnique<T = unknown>(options: AssetQueryUniqueOptions) {
		try {
			const result = await this.prisma.asset.findUnique({
				where: options.filter,
				...(options.select !== undefined ? { select: options.select } : {}),
			})

			return result as (typeof result & T) | null
		} catch (error) {
			this.logger.error('Find unique.', error)

			throw new DataAccessError()
		}
	}

	async findMany<T = unknown>(options: AssetQueryAllOptions = {}) {
		const pagination = this.buildPrismaPagination(options.pagination)

		try {
			const result = await this.prisma.asset.findMany({
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

	async count(options: AssetCountOptions): Promise<number> {
		try {
			return await this.prisma.asset.count({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
			})
		} catch (error) {
			this.logger.error('Count.', error)

			throw new DataAccessError()
		}
	}

	async create(options: AssetCreateOptions) {
		try {
			return await this.prisma.asset.create({
				data: options.data,
				...(options.select !== undefined ? { select: options.select } : {}),
			})
		} catch (error) {
			this.logger.error('Create.', error)

			throw new DataAccessError()
		}
	}

	async update(options: AssetUpdateOptions) {
		try {
			await this.prisma.asset.update({
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

export default AssetRepository
