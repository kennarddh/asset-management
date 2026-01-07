import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { useSearchParams } from 'react-router'

import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Chip,
	Grid,
	Pagination,
	Stack,
	Typography,
} from '@mui/material'

import { OrderStatus } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import OrderFindManySelfApi, { OrderFindManySelfSingleOutput } from 'Api/Order/OrderFindManySelfApi'
import { ApiPagination } from 'Api/Types'

const StatusToChipColor: Record<
	OrderStatus,
	'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
	[OrderStatus.Pending]: 'info',
	[OrderStatus.Approved]: 'primary',
	[OrderStatus.Rejected]: 'error',
	[OrderStatus.Cancelled]: 'warning',
	[OrderStatus.Active]: 'success',
	[OrderStatus.Overdue]: 'error',
	[OrderStatus.Returned]: 'success',
	[OrderStatus.ReturnedLate]: 'warning',
}

const MyOrders: FC = () => {
	const [SelfOrdersList, SetSelfOrdersList] = useState<OrderFindManySelfSingleOutput[]>([])
	const [PaginationInfo, SetPaginationInfo] = useState<ApiPagination>({
		page: 0,
		limit: 10,
		total: 0,
	})

	const [SearchParams, SetSearchParams] = useSearchParams()

	const { t } = useTranslation()

	const PaginationPage = useMemo(() => {
		const page = Number(SearchParams.get('page'))

		return Number.isNaN(page) || page < 1 ? 1 : page
	}, [SearchParams])

	const OnPaginationChange = useCallback(
		(_: React.ChangeEvent<unknown>, page: number) => {
			SetSearchParams({ page: page.toString() })
		},
		[SetSearchParams],
	)

	const RefreshData = useCallback(async () => {
		const orders = await OrderFindManySelfApi({
			pagination: { page: PaginationPage - 1, limit: 16 },
		})

		SetSelfOrdersList(orders.list)
		SetPaginationInfo(orders.pagination)

		if (PaginationPage >= orders.pagination.total / orders.pagination.limit) {
			SetSearchParams({
				page: Math.ceil(orders.pagination.total / orders.pagination.limit).toString(),
			})
		}
	}, [PaginationPage, SetSearchParams])

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		RefreshData().catch(console.error)
	}, [RefreshData])

	useEffect(() => {
		if (PaginationPage < 1) {
			SetSearchParams({ page: '1' })
		}
	}, [PaginationPage, SetSearchParams])

	return (
		<Stack sx={{ p: 4 }} gap={5}>
			<Grid container spacing={4}>
				{SelfOrdersList.map(order => (
					<Grid key={order.id} size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
						<Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
							<CardMedia
								component='img'
								image={order.asset.galleries[0]?.url ?? ''}
								alt={order.asset.name}
								sx={{ aspectRatio: '1/1', objectFit: 'contain' }}
							/>
							<CardContent sx={{ flexGrow: 1 }}>
								<Stack gap={1}>
									<Typography
										variant='h5'
										gutterBottom
										fontSize={20}
										sx={{
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
										}}
									>
										{order.id}: {order.asset.name}
									</Typography>
									<Chip
										label={order.status}
										color={StatusToChipColor[order.status]}
									/>
									<Typography
										variant='body2'
										color='textSecondary'
										sx={{
											display: '-webkit-box',
											WebkitLineClamp: 4,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
										}}
									>
										{order.description}
									</Typography>
								</Stack>
							</CardContent>
							<CardActions disableSpacing>
								<Button size='small'>{t('common:cancel')}</Button>
								<Button size='small'>{t('common:details')}</Button>
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>
			<Box display='flex' justifyContent='center'>
				<Pagination
					count={Math.ceil(PaginationInfo.total / PaginationInfo.limit)}
					page={PaginationPage}
					onChange={OnPaginationChange}
					color='primary'
				/>
			</Box>
		</Stack>
	)
}

export default MyOrders

export { MyOrders as Component }
