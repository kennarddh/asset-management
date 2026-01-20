import { FC, FormEvent, useCallback, useState, useTransition } from 'react'

import { useNavigate } from 'react-router'

import { Alert, Box, Button, FormControl, TextField } from '@mui/material'

import { useTranslation } from 'react-i18next'

import PageContainer from 'Components/Admin/PageContainer'

import HandleApiError from 'Utils/HandleApiError'

import AssetCategoryCreateApi from 'Api/Asset/Category/AssetCategoryCreateApi'

const NewAssetCategory: FC = () => {
	const [ErrorText, SetErrorText] = useState<string | null>(null)

	const [Name, SetName] = useState('')
	const [Description, SetDescription] = useState('')

	const [isPending, startTransition] = useTransition()

	const Navigate = useNavigate()

	const { t } = useTranslation('admin_assetCategories')

	const OnSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()

			startTransition(async () => {
				try {
					await AssetCategoryCreateApi({ name: Name, description: Description })

					await Navigate('../')
				} catch (error) {
					SetErrorText(await HandleApiError(error))
				}
			})
		},
		[Description, Name, Navigate],
	)

	return (
		<PageContainer title={t('admin_assetCategories:new.title')}>
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
						value={Name}
						onChange={event => SetName(event.target.value)}
						label={t('admin_assetCategories:name')}
						variant='outlined'
						required
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Description}
						onChange={event => SetDescription(event.target.value)}
						label={t('admin_assetCategories:description')}
						variant='outlined'
						multiline
					/>
				</FormControl>
				<Button type='submit' variant='outlined' fullWidth loading={isPending}>
					{t('common:submit')}
				</Button>
			</Box>
		</PageContainer>
	)
}

export default NewAssetCategory

export { NewAssetCategory as Component }
