import { FC, FormEvent, useCallback, useEffect, useState, useTransition } from 'react'

import { useNavigate, useParams } from 'react-router'

import { Alert, Box, Button, FormControl, TextField } from '@mui/material'

import { ApiErrorKind, ApiErrorResource } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import PageContainer from 'Components/Admin/PageContainer'

import HandleApiError from 'Utils/HandleApiError'

import AssetCategoryFindByIdApi from 'Api/Asset/Category/AssetCategoryFindByIdApi'
import AssetCategoryUpdateApi from 'Api/Asset/Category/AssetCategoryUpdateApi'

const EditAssetCategory: FC = () => {
	const { id } = useParams()

	const [ErrorText, SetErrorText] = useState<string | null>(null)
	const [HasLoaded, SetHasLoaded] = useState(false)

	const [Name, SetName] = useState('')
	const [Description, SetDescription] = useState('')

	const [isPending, startTransition] = useTransition()

	const Navigate = useNavigate()

	const { t } = useTranslation('admin_assetCategories')

	useEffect(() => {
		const main = async () => {
			if (!id) return await Navigate('../../')

			try {
				const assetCategory = await AssetCategoryFindByIdApi({ id })

				SetName(assetCategory.name)
				SetDescription(assetCategory.description)

				SetHasLoaded(true)
			} catch {
				await Navigate('../../')
			}
		}

		main().catch((error: unknown) => console.error('EditAssetCategory load error', error))
	}, [Navigate, id])

	const OnSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()

			if (!id) return
			if (!HasLoaded) return

			startTransition(async () => {
				try {
					await AssetCategoryUpdateApi({ id, name: Name })

					await Navigate('../../')
				} catch (error) {
					SetErrorText(
						await HandleApiError(error, async error => {
							if (
								error.resource === ApiErrorResource.AssetCategory &&
								error.kind === ApiErrorKind.NotFound
							) {
								return t('admin_assetCategories:errors.notFound')
							}
						}),
					)
				}
			})
		},
		[HasLoaded, Name, Navigate, id, t],
	)

	return (
		<PageContainer title={t('admin_assetCategories:edit.title')}>
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
				<Button
					type='submit'
					variant='outlined'
					fullWidth
					disabled={!HasLoaded}
					loading={isPending}
				>
					{t('common:submit')}
				</Button>
			</Box>
		</PageContainer>
	)
}

export default EditAssetCategory

export { EditAssetCategory as Component }
