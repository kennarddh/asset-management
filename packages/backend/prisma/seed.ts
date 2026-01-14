import argon2 from 'argon2'

import { AssetStatus, UserRole } from '@asset-management/common'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs/promises'

import { PrismaClient } from 'PrismaGenerated/client'

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
	adapter,
})

const main = async () => {
	if ((await prisma.user.count()) > 0) return

	let passwordHashSecret

	if (process.env.PASSWORD_HASH_SECRET_FILE) {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		passwordHashSecret = await fs.readFile(process.env.PASSWORD_HASH_SECRET_FILE, 'utf-8')
	} else {
		passwordHashSecret = process.env.PASSWORD_HASH_SECRET
	}

	if (!passwordHashSecret) {
		throw new Error('PASSWORD_HASH_SECRET is not set.')
	}

	const password = await argon2.hash('password', {
		hashLength: 64,
		secret: Buffer.from(passwordHashSecret),
	})

	await prisma.user.create({
		data: {
			username: 'admin',
			name: 'Admin',
			password,
			role: UserRole.Admin,
		},
	})

	await prisma.user.create({
		data: {
			username: 'member1',
			name: 'Member 1',
			password,
			role: UserRole.Member,
		},
	})

	await prisma.assetCategory.createMany({
		data: [
			{ id: 1, name: 'Electronics', description: 'Electronic devices and gadgets.' },
			{ id: 2, name: 'Furniture', description: 'Office and home furniture.' },
			{ id: 3, name: 'Vehicles', description: 'Cars, bikes, and other vehicles.' },
			{ id: 4, name: 'Venue', description: 'Rooms and spaces for events.' },
		],
	})

	await prisma.asset.create({
		data: {
			name: 'Digital Camera',
			description: 'A high-quality digital camera for photography enthusiasts.',
			quantity: 5,
			maximumLendingDuration: 14 * 24 * 60 * 60,
			status: AssetStatus.Available,
			categoryId: 1,
			requiresApproval: true,
			galleries: {
				createMany: {
					data: [
						{
							url: 'https://id.canon/media/image/2019/07/08/8d0db401031e4decbdf0d82dce54c796_G7+X+mkIII+BK+Front.png',
						},
						{
							url: 'https://id.canon/media/image/2018/08/23/9977987efab54910a9adaf41bdb95c3f_2.png',
						},
					],
				},
			},
		},
	})

	await prisma.asset.create({
		data: {
			name: 'Projector',
			description: 'A portable projector suitable for presentations and movie nights.',
			quantity: 3,
			maximumLendingDuration: 7 * 24 * 60 * 60,
			status: AssetStatus.Available,
			categoryId: 1,
			requiresApproval: true,
			galleries: {
				createMany: {
					data: [
						{
							url: 'https://images-cdn.ubuy.co.id/667f79fb498eb128a4199ebc-mini-projector-clokowe-2024-upgraded.jpg',
						},
					],
				},
			},
		},
	})

	await prisma.asset.create({
		data: {
			name: 'Conference Room',
			description: 'A fully equipped conference room for meetings and workshops.',
			quantity: 1,
			maximumLendingDuration: 1 * 24 * 60 * 60,
			status: AssetStatus.Available,
			categoryId: 4,
			requiresApproval: true,
			galleries: {
				createMany: {
					data: [
						{
							url: 'https://www.wework.com/ideas/wp-content/uploads/sites/4/2021/08/20201008-199WaterSt-2_fb.jpg?fit=1200%2C675',
						},
						{
							url: 'https://lansonplace.com/mallofasia/wp-content/uploads/sites/10/Meeting-Room.jpg.optimal.jpg',
						},
					],
				},
			},
		},
	})

	await prisma.asset.create({
		data: {
			name: 'Office Chair',
			description: 'Ergonomic office chair for comfortable seating during work hours.',
			quantity: 10,
			maximumLendingDuration: 30 * 24 * 60 * 60,
			status: AssetStatus.Available,
			categoryId: 2,
			requiresApproval: true,
			galleries: {
				createMany: {
					data: [
						{
							url: 'https://cellbell.in/cdn/shop/files/B08R5GR57J.MAIN.png?v=1734437270',
						},
					],
				},
			},
		},
	})

	await prisma.asset.create({
		data: {
			name: 'Mountain Bike',
			description: 'A durable mountain bike suitable for off-road adventures.',
			quantity: 4,
			maximumLendingDuration: 21 * 24 * 60 * 60,
			status: AssetStatus.Available,
			categoryId: 3,
			requiresApproval: true,
			galleries: {
				createMany: {
					data: [
						{
							url: 'https://images-cdn.ubuy.co.id/633a9d52fc1a5c5bee3e14eb-schwinn-bonafide-mens-mountain-bike.jpg',
						},
					],
				},
			},
		},
	})

	await prisma.asset.create({
		data: {
			name: 'Sound System',
			description: 'High-quality sound system for events and parties.',
			quantity: 2,
			maximumLendingDuration: 5 * 24 * 60 * 60,
			status: AssetStatus.Available,
			categoryId: 1,
			requiresApproval: true,
			galleries: {
				createMany: {
					data: [
						{
							url: 'https://id.jbl.com/dw/image/v2/AAUJ_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw683bfebf/JBL_EON715_3-4_Extreme_1605x1605.png?sw=537&sfrm=png',
						},
					],
				},
			},
		},
	})
}

try {
	await main()

	await prisma.$disconnect()
} catch (error) {
	console.error(error)

	await prisma.$disconnect()

	process.exit(1)
}
