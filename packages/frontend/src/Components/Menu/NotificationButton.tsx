import { FC, useEffect, useState } from 'react'

import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'

import NotificationCountApi from 'Api/Notification/NotificationCountApi'

import MenuButton from './MenuButton'

const NotificationButton: FC = () => {
	const [UnreadNotificationCount, SetUnreadNotificationCount] = useState<number>(0)

	useEffect(() => {
		const main = async () => {
			try {
				const data = await NotificationCountApi({ isRead: false })

				SetUnreadNotificationCount(data.count)
			} catch (error) {
				console.error('Error fetching unread notification count', error)
			}
		}

		void main()
	}, [])

	return (
		<MenuButton showBadge={UnreadNotificationCount > 0} badgeContent={UnreadNotificationCount}>
			<NotificationsRoundedIcon />
		</MenuButton>
	)
}

export default NotificationButton
