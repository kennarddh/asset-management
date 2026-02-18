import { FC, MouseEvent, useCallback, useEffect, useId, useMemo, useState } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'

import {
	Box,
	Button,
	CircularProgress,
	Divider,
	List,
	ListItem,
	ListItemText,
	Popover,
	Typography,
} from '@mui/material'

import { NotificationSortField, SortOrder } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import NotificationCountApi from 'Api/Notification/NotificationCountApi'
import NotificationFindManyApi, {
	NotificationFindManySingleOutput,
} from 'Api/Notification/NotificationFindManyApi'

import MenuButton from './MenuButton'

const pageLimit = 10

const NotificationButton: FC = () => {
	const [UnreadCount, SetUnreadCount] = useState(0)
	const [AnchorElement, SetAnchorElement] = useState<HTMLButtonElement | null>(null)

	const [Notifications, SetNotifications] = useState<NotificationFindManySingleOutput[]>([])
	const [Loading, SetLoading] = useState(false)
	const [Page, SetPage] = useState(1)
	const [HasMore, SetHasMore] = useState(false)

	const { t } = useTranslation(['notifications'])

	const FetchNotifications = useCallback(async (pageToFetch: number) => {
		SetLoading(true)

		try {
			const data = await NotificationFindManyApi({
				pagination: {
					page: pageToFetch,
					limit: pageLimit,
				},
				sort: {
					field: NotificationSortField.CreatedAt,
					order: SortOrder.Descending,
				},
			})

			SetNotifications(prev => [...prev, ...data.list])

			SetPage(pageToFetch)

			const { total, page: currentPage } = data.pagination

			SetHasMore((currentPage + 1) * pageLimit < total)
		} catch (error) {
			console.error('Error fetching notifications', error)
		} finally {
			SetLoading(false)
		}
	}, [])

	useEffect(() => {
		const fetchCount = async () => {
			try {
				const data = await NotificationCountApi({ isRead: false })

				SetUnreadCount(data.count)
			} catch (error) {
				console.error('Error fetching count', error)
			}
		}

		void fetchCount()
	}, [])

	useEffect(() => {
		const isOpen = !!AnchorElement

		if (isOpen) {
			void FetchNotifications(0)
		}
	}, [AnchorElement, FetchNotifications])

	const OnClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		SetAnchorElement(event.currentTarget)
	}, [])

	const OnClose = useCallback(() => {
		SetAnchorElement(null)
	}, [])

	const OnLoadMore = useCallback(() => {
		void FetchNotifications(Page + 1)
	}, [Page, FetchNotifications])

	const IsOpen = useMemo(() => !!AnchorElement, [AnchorElement])

	const Id = useId()

	return (
		<>
			<MenuButton
				onClick={OnClick}
				showBadge={UnreadCount > 0}
				badgeContent={UnreadCount}
				aria-describedby={Id}
			>
				<NotificationsRoundedIcon />
			</MenuButton>
			<Popover
				id={Id}
				open={IsOpen}
				anchorEl={AnchorElement}
				onClose={OnClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{
					paper: {
						sx: {
							width: 360,
							maxHeight: 500,
							display: 'flex',
							flexDirection: 'column',
						},
					},
				}}
			>
				<Box
					sx={{
						width: { xs: 300, sm: 360 },
						maxHeight: 500,
						overflowY: 'auto',
						flexGrow: 1,
					}}
				>
					{Notifications.length === 0 && !Loading ? (
						<Box sx={{ p: 3, textAlign: 'center' }}>
							<Typography variant='body2' color='text.secondary'>
								{t('notifications:noNotifications')}
							</Typography>
						</Box>
					) : (
						<List disablePadding>
							{Notifications.map(notification => (
								<Box key={notification.id}>
									<ListItem
										alignItems='flex-start'
										sx={{
											bgcolor: notification.isRead
												? 'transparent'
												: 'action.hover',
											cursor: 'pointer',
											'&:hover': { bgcolor: 'action.selected' },
										}}
									>
										<ListItemText
											sx={{ minWidth: 0, margin: 0 }}
											primary={
												<Typography variant='subtitle2'>
													{t(
														`notifications:templates.${notification.templateKey}.title`,
														notification.payload,
													)}
												</Typography>
											}
											secondary={
												<>
													<Typography
														variant='body2'
														color='text.primary'
														sx={{ display: 'block', mb: 0.5 }}
													>
														{t(
															`notifications:templates.${notification.templateKey}.text`,
															notification.payload,
														)}
													</Typography>
													<Typography
														variant='caption'
														color='text.secondary'
													>
														{t('common:dateTime', {
															date: notification.createdAt,
														})}
													</Typography>
												</>
											}
										/>
									</ListItem>
									<Divider component='li' />
								</Box>
							))}
						</List>
					)}
					{Loading && Page === 1 ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
							<CircularProgress size={24} />
						</Box>
					) : null}
					{HasMore ? (
						<Box sx={{ p: 1, textAlign: 'center' }}>
							<Button
								size='small'
								fullWidth
								onClick={OnLoadMore}
								disabled={Loading}
								startIcon={
									Loading ? <CircularProgress size={16} /> : <ExpandMoreIcon />
								}
							>
								{Loading ? t('common:loading') : t('common:loadMore')}
							</Button>
						</Box>
					) : null}
				</Box>
			</Popover>
		</>
	)
}

export default NotificationButton
