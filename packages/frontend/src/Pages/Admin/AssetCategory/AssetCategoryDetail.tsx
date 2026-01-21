import { FC, useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router'

import { Box, FormControl, TextField } from '@mui/material'

import { useTranslation } from 'react-i18next'

import PageContainer from 'Components/Admin/PageContainer'

import AssetCategoryFindByIdApi from 'Api/Asset/Category/AssetCategoryFindByIdApi'

const AssetCategoryDetail: FC = () => {
	const { id } = useParams()

	const [Name, SetName] = useState('')
	const [Description, SetDescription] = useState('')

	const Navigate = useNavigate()

	const { t } = useTranslation('admin_assetCategories')

	useEffect(() => {
		const main = async () => {
			if (!id) return await Navigate('../../')

			try {
				const assetCategory = await AssetCategoryFindByIdApi({ id })

				SetName(assetCategory.name)
				SetDescription(assetCategory.description)
			} catch {
				await Navigate('../../')
			}
		}

		main().catch((error: unknown) => console.error('AssetCategoryDetail load error', error))
	}, [Navigate, id])

	return (
		<PageContainer title={t('admin_assetCategories:edit.title')}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<FormControl fullWidth>
					<TextField
						value={Name}
						label={t('admin_assetCategories:name')}
						variant='outlined'
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					/>
				</FormControl>
				<FormControl fullWidth>
					<TextField
						value={Description}
						label={t('admin_assetCategories:description')}
						variant='outlined'
						multiline
						slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
					/>
				</FormControl>
			</Box>
		</PageContainer>
	)
}

export default AssetCategoryDetail

export { AssetCategoryDetail as Component }
