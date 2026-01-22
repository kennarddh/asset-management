import { FC, useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router'

import { Box, FormControl, MenuItem, TextField } from '@mui/material'
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField'

import { OrderStatus } from '@asset-management/common'
import dayjs from 'dayjs'
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
						value={Order.reason ?? ''}
						label={t('admin_orders:reason')}
						variant='outlined'
						multiline
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					/>
				</FormControl>
				<FormControl fullWidth>
					<DateTimeField
						label={t('admin_orders:requestedAt')}
						defaultValue={dayjs(Order.requestedAt)}
					/>
				</FormControl>
				<FormControl fullWidth>
					<DateTimeField
						label={t('admin_orders:updatedAt')}
						defaultValue={dayjs(Order.updatedAt)}
					/>
				</FormControl>
				<FormControl fullWidth>
					<DateTimeField
						label={t('admin_orders:finishAt')}
						defaultValue={dayjs(Order.finishAt)}
					/>
				</FormControl>
				<FormControl fullWidth>
					<DateTimeField
						label={t('admin_orders:startAt')}
						defaultValue={dayjs(Order.startAt)}
					/>
				</FormControl>
				<FormControl fullWidth>
					<DateTimeField
						label={t('admin_orders:approvedAt')}
						defaultValue={dayjs(Order.approvedAt)}
					/>
				</FormControl>
				<FormControl fullWidth>
					<DateTimeField
						label={t('admin_orders:rejectedAt')}
						defaultValue={dayjs(Order.rejectedAt)}
					/>
				</FormControl>
				<FormControl fullWidth>
					<DateTimeField
						label={t('admin_orders:returnedAt')}
						defaultValue={dayjs(Order.returnedAt)}
					/>
				</FormControl>
				<FormControl fullWidth>
					<DateTimeField
						label={t('admin_orders:canceledAt')}
						defaultValue={dayjs(Order.canceledAt)}
					/>
				</FormControl>
			</Box>
		</PageContainer>
	)
}

export default OrderDetail

export { OrderDetail as Component }
