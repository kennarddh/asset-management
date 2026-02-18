import { FC, FormEvent, useCallback, useState, useTransition } from 'react'

import { useNavigate } from 'react-router'

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import {
	Alert,
	Box,
	Button,
	FormControl,
	IconButton,
	InputAdornment,
	MenuItem,
	TextField,
} from '@mui/material'

import { ApiErrorKind, ApiErrorResource, UserRole } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import PageContainer from 'Components/Admin/PageContainer'

import HandleApiError from 'Utils/HandleApiError'

import UserCreateApi from 'Api/User/UserCreateApi'

const NewUser: FC = () => {
	const [IsPasswordVisible, SetIsPasswordVisible] = useState(false)
	const [ErrorText, SetErrorText] = useState<string | null>(null)

	const [Name, SetName] = useState('')
	const [Username, SetUsername] = useState('')
	const [Password, SetPassword] = useState('')
	const [Role, SetRole] = useState<UserRole | null>(null)

	const [isPending, startTransition] = useTransition()

	const Navigate = useNavigate()

	const { t } = useTranslation('admin_users')

	const OnSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()

			if (Role === null) return SetErrorText(t('admin_assets:errors.roleRequired'))

			startTransition(async () => {
				try {
					await UserCreateApi({
						name: Name,
						username: Username,
						password: Password,
						role: Role,
					})

					await Navigate('../')
				} catch (error) {
					SetErrorText(
						await HandleApiError(error, async error => {
							if (
								error.resource === ApiErrorResource.Username &&
								error.kind === ApiErrorKind.Taken
							) {
								return t('admin_users:errors.usernameTaken')
							}
						}),
					)
				}
			})
		},
		[Name, Navigate, Password, Role, Username, t],
	)

	return (
		<PageContainer title={t('admin_users:new.title')}>
			<Box
				component='form'
				noValidate
				onSubmit={OnSubmit}
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				{ErrorText !== null ? (
					<Alert severity='error' sx={{ width: '100%', whiteSpace: 'pre-line' }}>
						{ErrorText}
					</Alert>
				) : null}
				<FormControl fullWidth>
					<TextField
						value={Username}
						onChange={event => SetUsername(event.target.value)}
						label={t('admin_users:username')}
						variant='outlined'
						required
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Name}
						onChange={event => SetName(event.target.value)}
						label={t('admin_users:name')}
						variant='outlined'
						required
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Password}
						onChange={event => SetPassword(event.target.value)}
						label={t('admin_users:password')}
						variant='outlined'
						required
						autoComplete='new-password'
						type={IsPasswordVisible ? 'text' : 'password'}
						slotProps={{
							input: {
								endAdornment: (
									<InputAdornment position='end'>
										<IconButton
											aria-label={
												IsPasswordVisible
													? t('admin_users:hidePassword')
													: t('admin_users:showPassword')
											}
											onClick={() => SetIsPasswordVisible(prev => !prev)}
											onMouseDown={event => event.preventDefault()}
											onMouseUp={event => event.preventDefault()}
											edge='end'
										>
											{IsPasswordVisible ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						select
						label={t('admin_users:role')}
						value={Role}
						onChange={event => SetRole(event.target.value as UserRole)}
						sx={{ minWidth: 200 }}
						required
					>
						{Object.entries(UserRole).map(([key, value]) => (
							<MenuItem key={key} value={value}>
								{t(`admin_users:enums.role.${value}`)}
							</MenuItem>
						))}
					</TextField>
				</FormControl>
				<Button type='submit' variant='outlined' fullWidth loading={isPending}>
					{t('common:submit')}
				</Button>
			</Box>
		</PageContainer>
	)
}

export default NewUser

export { NewUser as Component }
