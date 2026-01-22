import { FC, useCallback, useEffect, useMemo, useState, useTransition } from 'react'

import { Navigate, useNavigate, useParams } from 'react-router'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import BlockIcon from '@mui/icons-material/Block'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CheckIcon from '@mui/icons-material/Check'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import WarningIcon from '@mui/icons-material/Warning'

import {
	Alert,
	Box,
	Button,
	CardMedia,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	Grid,
	IconButton,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'

import { ApiErrorKind, ApiErrorResource, AssetStatus } from '@asset-management/common'
import dayjs, { Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'

import HandleApiError from 'Utils/HandleApiError'

import AssetFindByIdApi, { AssetFindByIdOutput } from 'Api/Asset/AssetFindByIdApi'
import OrderCreateApi from 'Api/Order/OrderCreateApi'

const AssetDetail: FC = () => {
	const [AssetData, SetAssetData] = useState<AssetFindByIdOutput | null>()
	const [ActiveImageIndex, SetActiveImageIndex] = useState(0)

	const [ErrorText, SetErrorText] = useState<string | null>(null)

	const [IsCreateOrderModalOpen, SetIsCreateOrderModalOpen] = useState(false)
	const [OrderWasSuccessful, SetOrderWasSuccessful] = useState(false)
	const [CreateOrderDescription, SetCreateOrderDescription] = useState('')
	const [CreateOrderStartAt, SetCreateOrderStartAt] = useState<Dayjs | null>(null)
	const [CreateOrderFinishAt, SetCreateOrderFinishAt] = useState<Dayjs | null>(null)

	const { id } = useParams()

	const { t } = useTranslation('member_assets')

	const [isPending, startTransition] = useTransition()

	const NavigateHook = useNavigate()

	const RefreshData = useCallback(async () => {
		if (id === undefined) return

		try {
			const asset = await AssetFindByIdApi({
				id,
			})

			SetAssetData(asset)
		} catch (error) {
			await HandleApiError(error, async error => {
				if (
					error.resource === ApiErrorResource.Asset &&
					error.kind === ApiErrorKind.NotFound
				) {
					await NavigateHook('/assets')
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
		if (!AssetData) return

		SetActiveImageIndex(prev => (prev === AssetData.galleries.length - 1 ? 0 : prev + 1))
	}

	const OnPrevImage = () => {
		if (!AssetData) return

		SetActiveImageIndex(prev => (prev === 0 ? AssetData.galleries.length - 1 : prev - 1))
	}

	const OnCreateOrderModalClose = useCallback(() => {
		SetIsCreateOrderModalOpen(false)
		SetCreateOrderDescription('')
		SetCreateOrderStartAt(null)
		SetCreateOrderFinishAt(null)
		SetErrorText(null)
	}, [])

	const OnCreateOrderModalOpen = useCallback(() => {
		SetIsCreateOrderModalOpen(true)
		SetOrderWasSuccessful(false)
	}, [])

	const OnCreateOrderModalSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault()

			if (!id) return
			if (CreateOrderStartAt === null)
				return SetErrorText(t('member_assets:createOrder.errors.startAtRequired'))
			if (CreateOrderFinishAt === null)
				return SetErrorText(t('member_assets:createOrder.errors.finishAtRequired'))

			startTransition(async () => {
				try {
					await OrderCreateApi({
						assetId: id,
						description: CreateOrderDescription,
						startAt: CreateOrderStartAt.toDate().getTime(),
						finishAt: CreateOrderFinishAt.toDate().getTime(),
					})

					SetIsCreateOrderModalOpen(false)
					SetOrderWasSuccessful(true)

					SetCreateOrderDescription('')
					SetCreateOrderStartAt(null)
					SetCreateOrderFinishAt(null)
				} catch (error) {
					SetErrorText(
						await HandleApiError(error, async error => {
							if (
								error.resource === ApiErrorResource.User &&
								error.kind === ApiErrorKind.NotFound
							) {
								return t('member_assets:errors.notFound')
							} else if (
								error.resource === ApiErrorResource.DateTime &&
								error.kind === ApiErrorKind.Invalid
							) {
								return t('member_assets:createOrder.errors.invalidDateTime')
							} else if (
								error.resource === ApiErrorResource.Duration &&
								error.kind === ApiErrorKind.Invalid
							) {
								return t('member_assets:createOrder.errors.invalidDuration')
							}
						}),
					)
				}
			})
		},
		[CreateOrderDescription, CreateOrderFinishAt, CreateOrderStartAt, id, t],
	)

	const StatusColor = useMemo(() => {
		if (!AssetData) return 'default'

		if (AssetData.status === AssetStatus.Available) return 'success'
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (AssetData.status === AssetStatus.Delisted) return 'error'

		return 'default'
	}, [AssetData])

	const StatusIcon = useMemo(() => {
		if (!AssetData) return

		if (AssetData.status === AssetStatus.Available) return <CheckCircleIcon fontSize='small' />
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (AssetData.status === AssetStatus.Delisted) return <BlockIcon fontSize='small' />
	}, [AssetData])

	if (id === undefined) return <Navigate to='/assets' />

	if (!AssetData) return null

	// Safe access to current image URL
	const currentImageUrl =
		AssetData.galleries.length > 0 ? (AssetData.galleries[ActiveImageIndex]?.url ?? '') : ''

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
									alt={AssetData.name}
									sx={{
										width: '100%',
										height: '100%',
										objectFit: 'contain',
										transition: '0.3s',
									}}
								/>

								{AssetData.galleries.length > 1 && (
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

							{AssetData.galleries.length > 1 && (
								<Stack
									direction='row'
									spacing={2}
									sx={{ overflowX: 'auto', py: 1 }}
								>
									{AssetData.galleries.map((img, index) => (
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
								{OrderWasSuccessful && (
									<Alert severity='success' sx={{ mb: 3 }}>
										{t('member_assets:createOrder.orderSuccessAlert')}
									</Alert>
								)}

								<Stack
									direction='row'
									justifyContent='space-between'
									alignItems='flex-start'
									mb={2}
								>
									<Typography
										variant='overline'
										color='text.secondary'
										fontSize={14}
									>
										{AssetData.category.name}
									</Typography>

									<Chip
										label={AssetData.status}
										color={StatusColor}
										{...(StatusIcon && { icon: StatusIcon })}
										size='small'
										sx={{ fontWeight: 'bold' }}
									/>
								</Stack>

								<Typography variant='h3' fontWeight='bold' gutterBottom>
									{AssetData.name}
								</Typography>

								<Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
									<Grid size={{ xs: 6 }}>
										<Paper
											variant='outlined'
											sx={{ p: 2, bgcolor: 'background.default' }}
										>
											<Stack direction='row' spacing={1} alignItems='center'>
												<CalendarTodayIcon
													color='action'
													fontSize='small'
												/>
												<Typography variant='body2' color='text.secondary'>
													{t('common:minDuration')}
												</Typography>
											</Stack>
											<Typography variant='h6'>
												{t('common:duration', {
													value: AssetData.minimumLendingDuration,
												})}
											</Typography>
										</Paper>
									</Grid>
									<Grid size={{ xs: 6 }}>
										<Paper
											variant='outlined'
											sx={{ p: 2, bgcolor: 'background.default' }}
										>
											<Stack direction='row' spacing={1} alignItems='center'>
												<CalendarTodayIcon
													color='action'
													fontSize='small'
												/>
												<Typography variant='body2' color='text.secondary'>
													{t('common:maxDuration')}
												</Typography>
											</Stack>
											<Typography variant='h6'>
												{t('common:duration', {
													value: AssetData.maximumLendingDuration,
												})}
											</Typography>
										</Paper>
									</Grid>
								</Grid>

								{AssetData.requiresApproval && (
									<Alert severity='info' icon={<WarningIcon />} sx={{ mb: 3 }}>
										{t('member_assets:requiresApprovalAlert')}
									</Alert>
								)}

								<Divider sx={{ my: 2 }}>{t('common:description')}</Divider>

								<Typography
									variant='body1'
									color='text.secondary'
									sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}
								>
									{AssetData.description}
								</Typography>
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
										{t('common:dateTime', { date: AssetData.updatedAt })}
									</Typography>

									<Button
										variant='contained'
										size='large'
										startIcon={
											OrderWasSuccessful ? (
												<CheckIcon />
											) : (
												<ShoppingCartIcon />
											)
										}
										onClick={OnCreateOrderModalOpen}
										disabled={AssetData.status === AssetStatus.Delisted}
										color={OrderWasSuccessful ? 'success' : 'primary'}
										sx={{
											minWidth: '200px',
											py: 1.5,
											fontSize: '1rem',
											boxShadow: 2,
										}}
									>
										{AssetData.status === AssetStatus.Delisted
											? t('member_assets:assetDelisted')
											: t('common:orderNow')}
									</Button>
								</Stack>
							</Box>
						</Stack>
					</Grid>
				</Grid>
			</Stack>
			<Dialog
				open={IsCreateOrderModalOpen}
				onClose={OnCreateOrderModalClose}
				fullWidth
				maxWidth='md'
				slotProps={{
					paper: {
						sx: {
							height: '100%',
						},
					},
				}}
			>
				<DialogTitle>{t('member_assets:createOrder.title')}</DialogTitle>
				<DialogContent>
					<Box
						component='form'
						noValidate
						onSubmit={OnCreateOrderModalSubmit}
						id='order-form'
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
							mt: 2,
						}}
					>
						{ErrorText !== null ? (
							<Alert severity='error' sx={{ width: '100%', whiteSpace: 'pre-line' }}>
								{ErrorText}
							</Alert>
						) : null}

						<FormControl fullWidth>
							<DateTimePicker
								label={t('member_assets:startAt')}
								value={CreateOrderStartAt}
								onChange={newValue =>
									SetCreateOrderStartAt(newValue as Dayjs | null)
								}
								ampm={false}
								{...(CreateOrderFinishAt !== null
									? { maxDateTime: CreateOrderFinishAt }
									: {})}
								minDateTime={dayjs()}
							/>
						</FormControl>
						<FormControl fullWidth>
							<DateTimePicker
								label={t('member_assets:finishAt')}
								value={CreateOrderFinishAt}
								onChange={newValue =>
									SetCreateOrderFinishAt(newValue as Dayjs | null)
								}
								ampm={false}
								{...(CreateOrderFinishAt !== null
									? { minDateTime: CreateOrderFinishAt }
									: {})}
							/>
						</FormControl>
						<FormControl fullWidth>
							<TextField
								required
								label={t('member_assets:description')}
								multiline
								variant='standard'
								minRows={4}
								value={CreateOrderDescription}
								onChange={e => SetCreateOrderDescription(e.target.value)}
							/>
						</FormControl>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={OnCreateOrderModalClose}>{t('common:cancel')}</Button>
					<Button type='submit' form='order-form' loading={isPending}>
						{t('common:submit')}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

export default AssetDetail

export { AssetDetail as Component }
