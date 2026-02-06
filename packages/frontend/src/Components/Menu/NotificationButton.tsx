import { FC } from 'react'

import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'

import MenuButton from './MenuButton'

const NotificationButton: FC = () => {
	return (
		<MenuButton showBadge>
			<NotificationsRoundedIcon />
		</MenuButton>
	)
}

export default NotificationButton
