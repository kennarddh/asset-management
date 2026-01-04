import { FC, useCallback, useState } from 'react'

import { Link } from 'react-router'

import MenuIcon from '@mui/icons-material/Menu'

import {
	Avatar,
	Box,
	Container,
	Drawer,
	IconButton,
	List,
	ListItem,
	Stack,
	Typography,
} from '@mui/material'

import useAuthStore from 'Stores/AuthStore'
import { useTranslation } from 'react-i18next'

import UserMenu from './UserMenu'

const MenuItems: FC = () => {
	const { t } = useTranslation('member_navigations')

	return (
		<>
			<Typography component={Link} to='/' fontWeight={600} color='primary'>
				{t('member_navigations:links.home')}
			</Typography>
			<Typography component={Link} to='/assets' fontWeight={600} color='primary'>
				{t('member_navigations:links.assets')}
			</Typography>
			<Typography component={Link} to='/my-orders' fontWeight={600} color='primary'>
				{t('member_navigations:links.myOrders')}
			</Typography>
		</>
	)
}

const Navbar: FC = () => {
	const [Open, SetOpen] = useState<boolean>(false)

	const { t } = useTranslation('member_navigations')

	const user = useAuthStore(state => state.user)

	const OnOpen = useCallback(() => {
		SetOpen(true)
	}, [])

	const OnClose = useCallback(() => {
		SetOpen(false)
	}, [])

	if (user === null) return null

	return (
		<Stack>
			<Box
				sx={theme => ({
					backgroundColor: theme.palette.background.default,
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
					padding: '10px 0px',
					'& a': {
						textDecoration: 'none',
					},
				})}
			>
				<Container>
					<Stack
						direction='row'
						justifyContent='space-between'
						alignItems='center'
						sx={{ padding: '2px 0' }}
					>
						<Box component={Link} to='/'>
							<Typography fontWeight={600} variant='h5' color='primary'>
								{t('member_navigations:brand')}
							</Typography>
						</Box>
						<Stack
							direction='row'
							gap={4}
							alignItems='center'
							sx={{
								'& a:hover': {
									textDecoration: 'underline',
									transition: 'ease-in-out 0.2s',
								},
								display: {
									xs: 'none',
									lg: 'flex',
								},
							}}
						>
							<MenuItems />
						</Stack>
						<Box sx={{ display: { xs: 'block', lg: 'none' } }}>
							<IconButton
								sx={{ display: { md: 'block', lg: 'none' } }}
								onClick={OnOpen}
							>
								<MenuIcon />
							</IconButton>
						</Box>
						<Box
							flexDirection='row'
							alignItems='center'
							sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1 }}
						>
							<Avatar
								sizes='small'
								alt={user.name}
								src='https://avatars.githubusercontent.com/u/19550456'
								sx={{ width: 36, height: 36 }}
							/>
							<Typography
								variant='body2'
								sx={{ fontWeight: 500, lineHeight: '16px' }}
							>
								{user.name}
							</Typography>
							<UserMenu />
						</Box>
					</Stack>
				</Container>
			</Box>
			<Box
				sx={{
					display: { xs: 'block', lg: 'none' },
				}}
			>
				<Drawer anchor='right' open={Open} onClose={OnClose}>
					<Stack
						direction='column'
						justifyContent='space-between'
						sx={{ height: '100%' }}
					>
						<List>
							<ListItem sx={{ width: 300 }}>
								<Stack
									direction='column'
									gap={2}
									sx={{
										'& a': {
											textDecoration: 'none',
										},
									}}
								>
									<MenuItems />
								</Stack>
							</ListItem>
						</List>
						<Stack
							direction='row'
							sx={{
								p: 2,
								gap: 1,
								alignItems: 'center',
								borderTop: '1px solid',
								borderColor: 'divider',
							}}
						>
							<Avatar
								sizes='small'
								alt={user.name}
								src='https://avatars.githubusercontent.com/u/19550456'
								sx={{ width: 36, height: 36 }}
							/>
							<Box sx={{ mr: 'auto' }}>
								<Typography
									variant='body2'
									sx={{ fontWeight: 500, lineHeight: '16px' }}
								>
									{user.name}
								</Typography>
							</Box>
							<UserMenu />
						</Stack>
					</Stack>
				</Drawer>
			</Box>
		</Stack>
	)
}

export default Navbar
