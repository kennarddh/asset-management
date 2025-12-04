import { FC } from 'react'

import { Badge, IconButton, IconButtonProps, badgeClasses } from '@mui/material'

interface Props extends IconButtonProps {
	showBadge?: boolean
}

const MenuButton: FC<Props> = ({ showBadge = false, ...props }) => {
	return (
		<Badge
			color='error'
			variant='dot'
			invisible={!showBadge}
			sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
		>
			<IconButton size='small' {...props} />
		</Badge>
	)
}

export default MenuButton
