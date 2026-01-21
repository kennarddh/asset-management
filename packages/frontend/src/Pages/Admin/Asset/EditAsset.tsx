import { FC, FormEvent, useCallback, useEffect, useState, useTransition } from 'react'

import { useNavigate, useParams } from 'react-router'

import {
	Alert,
	Box,
	Button,
	FormControl,
	FormControlLabel,
	MenuItem,
	Switch,
	TextField,
} from '@mui/material'

import { ApiErrorKind, ApiErrorResource, AssetStatus } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import ImagesPreview from 'Components/Admin/ImagesPreview'
import PageContainer from 'Components/Admin/PageContainer'
import SelectAssetCategory from 'Components/Admin/SelectResources/SelectAssetCategory'

import HandleApiError from 'Utils/HandleApiError'

import AssetFindByIdApi from 'Api/Asset/AssetFindByIdApi'
import AssetUpdateApi from 'Api/Asset/AssetUpdateApi'

const EditAsset: FC = () => {
	const { id } = useParams()

	const [ErrorText, SetErrorText] = useState<string | null>(null)
	const [HasLoaded, SetHasLoaded] = useState(false)

	const [Name, SetName] = useState('')
	const [Description, SetDescription] = useState('')
	const [MaximumLendingDuration, SetMaximumLendingDuration] = useState<number>(0)
	const [MinimumLendingDuration, SetMinimumLendingDuration] = useState<number>(0)
	const [Status, SetStatus] = useState<AssetStatus>(AssetStatus.Available)
	const [RequiresApproval, SetRequiresApproval] = useState(true)
	const [CategoryId, SetCategoryId] = useState<string | null>(null)
	const [Galleries, SetGalleries] = useState<{ url: string }[]>([])

	const [isPending, startTransition] = useTransition()

	const Navigate = useNavigate()

	const { t } = useTranslation('admin_assets')

	useEffect(() => {
		const main = async () => {
			if (!id) return await Navigate('../../')

			try {
				const asset = await AssetFindByIdApi({ id })

				SetName(asset.name)
				SetDescription(asset.description)
				SetMaximumLendingDuration(asset.maximumLendingDuration)
				SetMinimumLendingDuration(asset.minimumLendingDuration)
				SetStatus(asset.status)
				SetRequiresApproval(asset.requiresApproval)
				SetCategoryId(asset.category.id)
				SetGalleries(
					asset.galleries.map(gallery => ({
						url: gallery.url,
					})),
				)

				SetHasLoaded(true)
			} catch {
				await Navigate('../../')
			}
		}

		main().catch((error: unknown) => console.error('EditAsset load error', error))
	}, [Navigate, id])

	const OnSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()

			if (!id) return
			if (!HasLoaded) return

			if (CategoryId === null) return SetErrorText(t('admin_assets:errors.groupRequired'))

			startTransition(async () => {
				try {
					await AssetUpdateApi({
						id,
						name: Name,
						description: Description,
						maximumLendingDuration: MaximumLendingDuration,
						minimumLendingDuration: MinimumLendingDuration,
						requiresApproval: RequiresApproval,
						status: Status,
						categoryId: CategoryId,
						galleries: Galleries,
					})

					await Navigate('../../')
				} catch (error) {
					SetErrorText(
						await HandleApiError(error, async error => {
							if (
								error.resource === ApiErrorResource.Asset &&
								error.kind === ApiErrorKind.NotFound
							) {
								return t('admin_assets:errors.notFound')
							}
						}),
					)
				}
			})
		},
		[
			CategoryId,
			Description,
			Galleries,
			HasLoaded,
			MaximumLendingDuration,
			MinimumLendingDuration,
			Name,
			Navigate,
			RequiresApproval,
			Status,
			id,
			t,
		],
	)

	const OnAddGalleryImage = useCallback(() => {
		// TODO: Replace with proper image upload dialog
		const imageUrl = window.prompt("Enter image URL to add to asset's gallery:")

		if (imageUrl) {
			SetGalleries(prevGalleries => [...prevGalleries, { url: imageUrl }])
		}
	}, [])

	const OnRemoveGalleryImage = useCallback((index: number) => {
		SetGalleries(prevGalleries => prevGalleries.filter((_, i) => i !== index))
	}, [])

	return (
		<PageContainer title={t('admin_assets:detail.title')}>
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
						label={t('admin_assets:name')}
						variant='outlined'
						required
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Description}
						onChange={event => SetDescription(event.target.value)}
						label={t('admin_assets:description')}
						variant='outlined'
						multiline
					/>
				</FormControl>
				<FormControl fullWidth>
					<FormControlLabel
						control={
							<Switch
								checked={RequiresApproval}
								onChange={(_, checked) => SetRequiresApproval(checked)}
							/>
						}
						label={t('admin_assets:requiresApproval')}
					/>
				</FormControl>
				<FormControl fullWidth>
					<SelectAssetCategory
						value={CategoryId}
						onChange={SetCategoryId}
						onError={error => {
							SetErrorText(error)
							SetCategoryId(null)
						}}
						shrinkedText={t('admin_assets:category')}
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						select
						label={t('admin_assets:status')}
						value={Status}
						onChange={event => SetStatus(event.target.value as AssetStatus)}
						sx={{ minWidth: 200 }}
						required
					>
						{Object.entries(AssetStatus).map(([key, value]) => (
							<MenuItem key={key} value={value}>
								{t(`admin_assets:enums.status.${value}`)}
							</MenuItem>
						))}
					</TextField>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						type='number'
						value={MinimumLendingDuration}
						onChange={event =>
							SetMinimumLendingDuration(Math.max(0, Number(event.target.value)))
						}
						label={t('admin_assets:minimumLendingDuration')}
						variant='outlined'
						slotProps={{ htmlInput: { min: 0 } }}
						required
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						type='number'
						value={MaximumLendingDuration}
						onChange={event =>
							SetMaximumLendingDuration(Math.max(0, Number(event.target.value)))
						}
						label={t('admin_assets:maximumLendingDuration')}
						variant='outlined'
						slotProps={{ htmlInput: { min: 0 } }}
						required
					/>
				</FormControl>
				<ImagesPreview
					images={Galleries}
					onAddGalleryImage={OnAddGalleryImage}
					onRemoveGalleryImage={OnRemoveGalleryImage}
				/>
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

export default EditAsset

export { EditAsset as Component }
