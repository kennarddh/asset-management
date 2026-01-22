import { FC, useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router'

import {
	Alert,
	Box,
	FormControl,
	FormControlLabel,
	MenuItem,
	Switch,
	TextField,
} from '@mui/material'

import { AssetStatus } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import ImagesPreview from 'Components/Admin/ImagesPreview'
import PageContainer from 'Components/Admin/PageContainer'
import SelectAssetCategory from 'Components/Admin/SelectResources/SelectAssetCategory'

import AssetFindByIdApi from 'Api/Asset/AssetFindByIdApi'

const AssetDetail: FC = () => {
	const { id } = useParams()

	const [ErrorText, SetErrorText] = useState<string | null>(null)

	const [Name, SetName] = useState('')
	const [Description, SetDescription] = useState('')
	const [MaximumLendingDuration, SetMaximumLendingDuration] = useState<number>(0)
	const [MinimumLendingDuration, SetMinimumLendingDuration] = useState<number>(0)
	const [Status, SetStatus] = useState<AssetStatus>(AssetStatus.Available)
	const [RequiresApproval, SetRequiresApproval] = useState(true)
	const [CategoryId, SetCategoryId] = useState<string | null>(null)
	const [Galleries, SetGalleries] = useState<{ url: string }[]>([])

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
			} catch {
				await Navigate('../../')
			}
		}

		main().catch((error: unknown) => console.error('AssetDetail load error', error))
	}, [Navigate, id])

	return (
		<PageContainer title={t('admin_assets:detail.title')}>
			<Box
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
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Description}
						onChange={event => SetDescription(event.target.value)}
						label={t('admin_assets:description')}
						variant='outlined'
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
						multiline
					/>
				</FormControl>
				<FormControl fullWidth>
					<FormControlLabel
						control={<Switch checked={RequiresApproval} readOnly />}
						label={t('admin_assets:requiresApproval')}
					/>
				</FormControl>
				<FormControl fullWidth>
					<SelectAssetCategory
						value={CategoryId}
						onError={error => SetErrorText(error)}
						shrinkedText={t('admin_assets:category')}
						disabled
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						select
						label={t('admin_assets:status')}
						value={Status}
						onChange={event => SetStatus(event.target.value as AssetStatus)}
						sx={{ minWidth: 200 }}
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
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
						slotProps={{
							htmlInput: { min: 0 },
							inputLabel: { shrink: true },
							input: { readOnly: true },
						}}
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
						slotProps={{
							htmlInput: { min: 0 },
							inputLabel: { shrink: true },
							input: { readOnly: true },
						}}
					/>
				</FormControl>
				<ImagesPreview images={Galleries} disabled />
			</Box>
		</PageContainer>
	)
}

export default AssetDetail

export { AssetDetail as Component }
