import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { Navigate, useNavigate, useParams } from 'react-router'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'

import {
	Box,
	CardMedia,
	Chip,
	Divider,
	Grid,
	IconButton,
	Paper,
	Stack,
	Typography,
} from '@mui/material'
import { DateTimeField } from '@mui/x-date-pickers'

import { ApiErrorKind, ApiErrorResource, OrderStatus } from '@asset-management/common'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import HandleApiError from 'Utils/HandleApiError'

import OrderFindByIdApi, { OrderFindByIdOutput } from 'Api/Order/OrderFindByIdApi'
import OrderStatusToColor from 'Constants/OrderStatusToColor'

const OrderDetail: FC = () => {
	const [OrderData, SetOrderData] = useState<OrderFindByIdOutput | null>()
	const [ActiveImageIndex, SetActiveImageIndex] = useState(0)

	const { id } = useParams()

	const { t } = useTranslation('member_myOrders')

	const NavigateHook = useNavigate()

	const RefreshData = useCallback(async () => {
		if (id === undefined) return

		try {
			const order = await OrderFindByIdApi({
				id,
			})

			SetOrderData(order)
		} catch (error) {
			await HandleApiError(error, async error => {
				if (
					error.resource === ApiErrorResource.Order &&
					error.kind === ApiErrorKind.NotFound
				) {
					await NavigateHook('/orders')
				}

				return undefined
			})
		}
	}, [id, NavigateHook])

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		RefreshData().catch(console.error)
	}, [RefreshData])

	const OnNextImage = () => {
		if (!OrderData) return

		SetActiveImageIndex(prev => (prev === OrderData.asset.galleries.length - 1 ? 0 : prev + 1))
	}

	const OnPrevImage = () => {
		if (!OrderData) return

		SetActiveImageIndex(prev => (prev === 0 ? OrderData.asset.galleries.length - 1 : prev - 1))
	}

	const StatusIcon = useMemo(() => {
		if (!OrderData) return

		if (OrderData.status === OrderStatus.Active) return <PlayCircleIcon fontSize='small' />
		if (OrderData.status === OrderStatus.Approved) return <CheckCircleIcon fontSize='small' />
		if (OrderData.status === OrderStatus.Canceled) return <CancelIcon fontSize='small' />
		if (OrderData.status === OrderStatus.Overdue) return <ErrorIcon fontSize='small' />
		if (OrderData.status === OrderStatus.Pending) return <HourglassEmptyIcon fontSize='small' />
		if (OrderData.status === OrderStatus.Rejected) return <RemoveCircleIcon fontSize='small' />
		if (OrderData.status === OrderStatus.Returned)
			return <AssignmentTurnedInIcon fontSize='small' />
		if (OrderData.status === OrderStatus.ReturnedLate)
			return <AssignmentLateIcon fontSize='small' />
	}, [OrderData])

	if (id === undefined) return <Navigate to='/orders' />

	if (!OrderData) return null

	// Safe access to current image URL
	const currentImageUrl =
		OrderData.asset.galleries.length > 0
			? (OrderData.asset.galleries[ActiveImageIndex]?.url ?? '')
			: ''

	return (
		<>
			<Stack sx={{ p: 4, maxWidth: '1600px', margin: '0 auto' }} gap={4}>
				<Grid container spacing={6}>
					<Grid size={{ xs: 12, md: 6, lg: 5 }}>
						<Stack spacing={2}>
							<Paper
								elevation={0}
								sx={{
									position: 'relative',
									width: '100%',
									aspectRatio: '1/1',
									overflow: 'hidden',
									borderRadius: 2,
									bgcolor: 'grey.100',
									border: '1px solid',
									borderColor: 'divider',
								}}
							>
								<CardMedia
									component='img'
									image={currentImageUrl}
									alt={OrderData.asset.name}
									sx={{
										width: '100%',
										height: '100%',
										objectFit: 'contain',
										transition: '0.3s',
									}}
								/>

								{OrderData.asset.galleries.length > 1 && (
									<>
										<IconButton
											onClick={OnPrevImage}
											sx={{
												position: 'absolute',
												left: 10,
												top: '50%',
												transform: 'translateY(-50%)',
												bgcolor: 'rgba(255,255,255,0.8)',
												'&:hover': { bgcolor: 'white' },
											}}
										>
											<ArrowBackIosNewIcon fontSize='small' />
										</IconButton>
										<IconButton
											onClick={OnNextImage}
											sx={{
												position: 'absolute',
												right: 10,
												top: '50%',
												transform: 'translateY(-50%)',
												bgcolor: 'rgba(255,255,255,0.8)',
												'&:hover': { bgcolor: 'white' },
											}}
										>
											<ArrowForwardIosIcon fontSize='small' />
										</IconButton>
									</>
								)}
							</Paper>

							{OrderData.asset.galleries.length > 1 && (
								<Stack
									direction='row'
									spacing={2}
									sx={{ overflowX: 'auto', py: 1 }}
								>
									{OrderData.asset.galleries.map((img, index) => (
										<Box
											key={img.id}
											onClick={() => SetActiveImageIndex(index)}
											sx={{
												width: 80,
												height: 80,
												flexShrink: 0,
												borderRadius: 1,
												overflow: 'hidden',
												cursor: 'pointer',
												border: '2px solid',
												borderColor:
													ActiveImageIndex === index
														? 'primary.main'
														: 'transparent',
												opacity: ActiveImageIndex === index ? 1 : 0.6,
												transition: 'all 0.2s',
												'&:hover': { opacity: 1 },
											}}
										>
											<img
												src={img.url}
												alt={`Thumbnail ${index}`}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												}}
											/>
										</Box>
									))}
								</Stack>
							)}
						</Stack>
					</Grid>

					<Grid size={{ xs: 12, md: 6, lg: 7 }}>
						<Stack height='100%' justifyContent='space-between' spacing={4}>
							<Box>
								<Stack
									direction='row'
									justifyContent='flex-end'
									alignItems='flex-start'
									mb={2}
								>
									<Chip
										label={t(
											`member_myOrders:enums.status.${OrderData.status}`,
										)}
										color={OrderStatusToColor[OrderData.status]}
										{...(StatusIcon && { icon: StatusIcon })}
										size='small'
										sx={{ fontWeight: 'bold' }}
									/>
								</Stack>

								<Typography variant='h3' fontWeight='bold' gutterBottom>
									{OrderData.asset.name}
								</Typography>

								<Divider sx={{ my: 2 }}>{t('common:description')}</Divider>

								<Typography
									variant='body1'
									color='text.secondary'
									sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}
								>
									{OrderData.description}
								</Typography>

								<Divider sx={{ my: 2 }}>{t('common:reason')}</Divider>

								<Typography
									variant='body1'
									color='text.secondary'
									sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}
								>
									{OrderData.reason}
								</Typography>

								<Divider sx={{ mb: 3 }} />

								<Grid container spacing={2}>
									<Grid size={4}>
										<DateTimeField
											label={t('member_myOrders:requestedAt')}
											defaultValue={dayjs(OrderData.requestedAt)}
										/>
									</Grid>
									<Grid size={4}>
										<DateTimeField
											label={t('member_myOrders:updatedAt')}
											defaultValue={dayjs(OrderData.updatedAt)}
										/>
									</Grid>
									<Grid size={4}>
										<DateTimeField
											label={t('member_myOrders:finishAt')}
											defaultValue={dayjs(OrderData.finishAt)}
										/>
									</Grid>
									<Grid size={4}>
										<DateTimeField
											label={t('member_myOrders:startAt')}
											defaultValue={dayjs(OrderData.startAt)}
										/>
									</Grid>
									<Grid size={4}>
										<DateTimeField
											label={t('member_myOrders:approvedAt')}
											defaultValue={dayjs(OrderData.approvedAt)}
										/>
									</Grid>
									<Grid size={4}>
										<DateTimeField
											label={t('member_myOrders:rejectedAt')}
											defaultValue={dayjs(OrderData.rejectedAt)}
										/>
									</Grid>
									<Grid size={4}>
										<DateTimeField
											label={t('member_myOrders:returnedAt')}
											defaultValue={dayjs(OrderData.returnedAt)}
										/>
									</Grid>
									<Grid size={4}>
										<DateTimeField
											label={t('member_myOrders:canceledAt')}
											defaultValue={dayjs(OrderData.canceledAt)}
										/>
									</Grid>
								</Grid>
							</Box>

							<Box pt={4}>
								<Divider sx={{ mb: 3 }} />
								<Stack
									direction={{ xs: 'column-reverse', sm: 'row' }}
									spacing={2}
									alignItems='center'
									justifyContent='space-between'
								>
									<Typography variant='caption' color='text.secondary'>
										{t('common:lastUpdated')}:{' '}
										{t('common:dateTime', { date: OrderData.updatedAt })}
									</Typography>
								</Stack>
							</Box>
						</Stack>
					</Grid>
				</Grid>
			</Stack>
		</>
	)
}

export default OrderDetail

export { OrderDetail as Component }
