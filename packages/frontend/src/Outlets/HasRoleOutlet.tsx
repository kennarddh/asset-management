import { FC, useCallback } from 'react'

import { Outlet, useNavigate } from 'react-router'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import HomeIcon from '@mui/icons-material/Home'

import { Box, Button, Container, Typography, alpha } from '@mui/material'

import { UserRole } from '@asset-management/common'
import useAuthStore from 'Stores/AuthStore'
import { useTranslation } from 'react-i18next'

export interface HasRoleOutletProps {
	role: UserRole
}

const HasRoleOutlet: FC<HasRoleOutletProps> = props => {
	const userRole = useAuthStore(state => state.user?.role ?? null)

	const Navigate = useNavigate()

	const { t } = useTranslation()

	const Back = useCallback(async () => {
		await Navigate(-1)
	}, [Navigate])

	const Home = useCallback(async () => {
		await Navigate('/')
	}, [Navigate])

	if (userRole !== null && props.role == userRole) return <Outlet />

	return (
		<Box
			sx={theme => ({
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 2,
				background: `linear-gradient(180deg, #ffffff 50%, ${alpha(theme.palette.primary.light, 0.5)} 100%)`,
			})}
		>
			<Typography variant='h4'>{t('errors:accessDenied.title')}</Typography>
			<Typography
				sx={{
					textAlign: 'center',
					maxWidth: {
						md: '50%',
						xs: '90%',
					},
				}}
			>
				{t('errors:accessDenied.text')}
			</Typography>
			<Container sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
				<Button variant='contained' onClick={Back} startIcon={<ArrowBackIosNewIcon />}>
					{t('common:back')}
				</Button>
				<Button variant='contained' onClick={Home} startIcon={<HomeIcon />}>
					{t('common:home')}
				</Button>
			</Container>
		</Box>
	)
}

export default HasRoleOutlet
