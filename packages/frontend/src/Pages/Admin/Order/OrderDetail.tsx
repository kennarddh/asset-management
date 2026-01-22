import { FC, useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router'

import { Box, FormControl, MenuItem, TextField } from '@mui/material'

import { OrderStatus } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import PageContainer from 'Components/Admin/PageContainer'

import OrderFindByIdApi, { OrderFindByIdOutput } from 'Api/Order/OrderFindByIdApi'

const OrderDetail: FC = () => {
	const { id } = useParams()

	const [Order, SetOrder] = useState<OrderFindByIdOutput | null>(null)

	const Navigate = useNavigate()

	const { t } = useTranslation('admin_orders')

	useEffect(() => {
		const main = async () => {
			if (!id) return await Navigate('../../')

			try {
				const order = await OrderFindByIdApi({ id })

				SetOrder(order)
			} catch {
				await Navigate('../../')
			}
		}

		main().catch((error: unknown) => console.error('OrderDetail load error', error))
	}, [Navigate, id])

	// TODO: Replace with loading
	if (Order === null) return null

	return (
		<PageContainer title={t('admin_orders:detail.title')}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<FormControl fullWidth>
					<TextField
						value={Order.user.name}
						label={t('admin_orders:user')}
						variant='outlined'
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Order.asset.name}
						label={t('admin_orders:asset')}
						variant='outlined'
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						select
						label={t('admin_orders:status')}
						value={Order.status}
						sx={{ minWidth: 200 }}
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					>
						{Object.entries(OrderStatus).map(([key, value]) => (
							<MenuItem key={key} value={value}>
								{t(`admin_orders:enums.status.${value}`)}
							</MenuItem>
						))}
					</TextField>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Order.description}
						label={t('admin_orders:description')}
						variant='outlined'
						multiline
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Order.reason}
						label={t('admin_orders:reason')}
						variant='outlined'
						multiline
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					/>
				</FormControl>
				<FormControl fullWidth>
					{/* TODO: Install npm install @mui/x-date-pickers*/}
					{/* <DateTimePicker label={t('admin_orders:requestedAt')} value={Order.requestedAt} readOnly />
					<DateTimePicker label={t('admin_orders:updatedAt')} value={Order.updatedAt} readOnly />
					<DateTimePicker label={t('admin_orders:finishAt')} value={Order.finishAt} readOnly />
					<DateTimePicker label={t('admin_orders:startAt')} value={Order.startAt} readOnly />
					<DateTimePicker label={t('admin_orders:approvedAt')} value={Order.approvedAt} readOnly />
					<DateTimePicker label={t('admin_orders:rejectedAt')} value={Order.rejectedAt} readOnly />
					<DateTimePicker label={t('admin_orders:returnedAt')} value={Order.returnedAt} readOnly />
					<DateTimePicker label={t('admin_orders:canceledAt')} value={Order.canceledAt} readOnly /> */}
				</FormControl>
			</Box>
		</PageContainer>
	)
}

export default OrderDetail

export { OrderDetail as Component }
