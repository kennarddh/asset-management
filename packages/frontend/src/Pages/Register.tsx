import { FC, FormEvent, useCallback, useState, useTransition } from 'react'

import { Link as RouterLink, useNavigate } from 'react-router'

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import {
	Alert,
	Box,
	Button,
	FormControl,
	IconButton,
	InputAdornment,
	Link,
	TextField,
	Typography,
} from '@mui/material'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import { FormatParsingError, IsApiResponseError } from 'Api'
import { useTranslation } from 'react-i18next'

import AuthRegisterApi from 'Api/Auth/AuthRegisterApi'

const Register: FC = () => {
	const [IsPasswordVisible, SetIsPasswordVisible] = useState(false)
	const [ErrorText, SetErrorText] = useState<string | null>(null)

	const [Name, SetName] = useState('')
	const [Username, SetUsername] = useState('')
	const [Password, SetPassword] = useState('')

	const [isPending, startTransition] = useTransition()

	const Navigate = useNavigate()

	const { t } = useTranslation('auth')

	const OnRegister = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()

			startTransition(async () => {
				try {
					await AuthRegisterApi({
						name: Name,
						username: Username,
						password: Password,
					})

					await Navigate('/login')
				} catch (error) {
					if (IsApiResponseError(error)) {
						if (error.apiErrorResponse.errors.parsing) {
							const formattedParsingErrors = FormatParsingError(
								error.apiErrorResponse.errors.parsing,
							)

							const formattedParsingError = formattedParsingErrors.join('\n')

							SetErrorText(formattedParsingError)
						} else if (error.apiErrorResponse.errors.others) {
							if (
								error.apiErrorResponse.errors.others[0]?.resource ===
									ApiErrorResource.Username &&
								error.apiErrorResponse.errors.others[0].kind === ApiErrorKind.Taken
							) {
								SetErrorText(t('auth:errors.usernameTaken'))
							} else if (
								error.apiErrorResponse.errors.others[0]?.resource === null &&
								error.apiErrorResponse.errors.others[0].kind ===
									ApiErrorKind.InternalServerError
							) {
								SetErrorText(t('errors:unknown.text'))
							}
						} else {
							console.error('Unknown Register error occured.', error)

							SetErrorText(t('errors:unknown.text'))
						}
					} else {
						console.error('Register error', error)

						SetErrorText(t('errors:network.text'))
					}
				}
			})
		},
		[Name, Username, Password, Navigate, t],
	)

	return (
		<Box
			sx={{
				height: '100dvh',
				width: '100dvw',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Box
				component='form'
				sx={{
					padding: '30px',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'column',
					gap: '10px',
					width: { xs: '90%', sm: '60%', md: '40%' },
				}}
				border={1}
				borderColor='divider'
				borderRadius={2}
				noValidate
				autoComplete='off'
				onSubmit={OnRegister}
			>
				<Typography
					component='h1'
					variant='h4'
					sx={{
						width: '100%',
						textAlign: 'center',
						fontSize: '10dwv',
					}}
				>
					{t('auth:register.title')}
				</Typography>
				{ErrorText !== null ? (
					<Alert severity='error' sx={{ width: '100%', whiteSpace: 'pre-line' }}>
						{ErrorText}
					</Alert>
				) : null}
				<FormControl fullWidth sx={{ m: 1, width: '100%' }}>
					<TextField
						value={Name}
						onChange={event => SetName(event.target.value)}
						label={t('auth:name')}
						variant='outlined'
						required
						autoComplete='name'
					/>
				</FormControl>
				<FormControl fullWidth sx={{ m: 1, width: '100%' }}>
					<TextField
						value={Username}
						onChange={event => SetUsername(event.target.value)}
						label={t('auth:username')}
						variant='outlined'
						required
						autoComplete='username'
					/>
				</FormControl>
				<FormControl sx={{ m: 1, width: '100%' }}>
					<TextField
						value={Password}
						onChange={event => SetPassword(event.target.value)}
						label={t('auth:password')}
						variant='outlined'
						required
						autoComplete='password'
						type={IsPasswordVisible ? 'text' : 'password'}
						slotProps={{
							input: {
								endAdornment: (
									<InputAdornment position='end'>
										<IconButton
											aria-label={
												IsPasswordVisible
													? t('auth:hidePassword')
													: t('auth:showPassword')
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
				<Link component={RouterLink} fontSize='0.75rem' to='/login'>
					{t('auth:haveAccountLoginLink')}
				</Link>
				<Button type='submit' variant='outlined' sx={{ width: '100%' }} loading={isPending}>
					{t('auth:register.submit')}
				</Button>
			</Box>
		</Box>
	)
}

export default Register

export { Register as Component }
