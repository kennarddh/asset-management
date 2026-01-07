import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { Link, useSearchParams } from 'react-router'

import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Grid,
	Pagination,
	Stack,
	Typography,
} from '@mui/material'

import { useTranslation } from 'react-i18next'

import AssetFindManyApi, { AssetFindManySingleOutput } from 'Api/Asset/AssetFindManyApi'
import { ApiPagination } from 'Api/Types'

const Assets: FC = () => {
	const [AssetsList, SetAssetsList] = useState<AssetFindManySingleOutput[]>([])
	const [PaginationInfo, SetPaginationInfo] = useState<ApiPagination>({
		page: 0,
		limit: 10,
		total: 0,
	})

	const [SearchParams, SetSearchParams] = useSearchParams()

	const { t } = useTranslation()

	const PaginationPage = useMemo(() => {
		const page = Number(SearchParams.get('page'))

		return Number.isNaN(page) || page < 1 ? 1 : page
	}, [SearchParams])

	const OnPaginationChange = useCallback(
		(_: React.ChangeEvent<unknown>, page: number) => {
			SetSearchParams({ page: page.toString() })
		},
		[SetSearchParams],
	)

	const RefreshData = useCallback(async () => {
		const assets = await AssetFindManyApi({
			pagination: { page: PaginationPage - 1, limit: 16 },
		})

		SetAssetsList(assets.list)
		SetPaginationInfo(assets.pagination)

		if (PaginationPage >= assets.pagination.total / assets.pagination.limit) {
			SetSearchParams({
				page: Math.ceil(assets.pagination.total / assets.pagination.limit).toString(),
			})
		}
	}, [PaginationPage, SetSearchParams])

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		RefreshData().catch(console.error)
	}, [RefreshData])

	useEffect(() => {
		if (PaginationPage < 1) {
			SetSearchParams({ page: '1' })
		}
	}, [PaginationPage, SetSearchParams])

	return (
		<Stack sx={{ p: 4 }} gap={5}>
			<Grid container spacing={4}>
				{AssetsList.map(asset => (
					<Grid key={asset.id} size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
						<Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
							<CardMedia
								component='img'
								image={asset.galleries[0]?.url ?? ''}
								alt={asset.name}
								sx={{ aspectRatio: '1/1', objectFit: 'contain' }}
							/>
							<CardContent sx={{ flexGrow: 1 }}>
								<Stack>
									<Typography
										variant='h5'
										gutterBottom
										fontSize={20}
										sx={{
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
										}}
									>
										{asset.name}
									</Typography>
								</Stack>
								<Typography
									variant='body2'
									color='textSecondary'
									sx={{
										display: '-webkit-box',
										WebkitLineClamp: 4,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
									}}
								>
									{asset.description}
								</Typography>
							</CardContent>
							<CardActions disableSpacing>
								<Button size='small' component={Link} to={`/assets/${asset.id}`}>
									{t('common:details')}
								</Button>
								<Button size='small'>{t('common:order')}</Button>
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>
			<Box display='flex' justifyContent='center'>
				<Pagination
					count={Math.ceil(PaginationInfo.total / PaginationInfo.limit)}
					page={PaginationPage}
					onChange={OnPaginationChange}
					color='primary'
				/>
			</Box>
		</Stack>
	)
}

export default Assets

export { Assets as Component }
