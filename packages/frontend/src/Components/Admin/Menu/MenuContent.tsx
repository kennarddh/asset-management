import { FC, JSX, useMemo } from 'react'

import { Link, useLocation } from 'react-router'

import HomeRoundedIcon from '@mui/icons-material/HomeRounded'

import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack } from '@mui/material'

import { useTranslation } from 'react-i18next'

export interface MenuListItem {
	text: string
	to: string
	icon?: JSX.Element
}

const MenuContent: FC<{ onClickLink?: () => void }> = props => {
	const Location = useLocation()

	const { t } = useTranslation('admin_navigations')

	const MenuListItems = useMemo<MenuListItem[]>(
		() => [
			{
				text: t('admin_navigations:links.home'),
				to: '/admin/',
				icon: <HomeRoundedIcon />,
			},
		],
		[t],
	)

	return (
		<Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
			<List dense>
				{MenuListItems.map((item, index) => (
					<ListItem key={index} disablePadding sx={{ display: 'block' }}>
						<ListItemButton
							component={Link}
							to={item.to}
							selected={Location.pathname === item.to}
							onClick={props.onClickLink}
						>
							{item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
							<ListItemText primary={item.text} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Stack>
	)
}

export default MenuContent
