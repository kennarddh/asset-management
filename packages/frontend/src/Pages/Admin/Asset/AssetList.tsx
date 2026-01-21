import { FC, useCallback, useMemo, useRef, useState } from 'react'

import { useNavigate, useSearchParams } from 'react-router'

import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'

import { InputAdornment, MenuItem, TextField } from '@mui/material'
import {
	GridActionsCellItem,
	GridColDef,
	GridDataSource,
	GridGetRowsParams,
	GridGetRowsResponse,
} from '@mui/x-data-grid'

import { AssetSortField, AssetStatus } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import ListPageTemplate, { ListPageTemplateHandle } from 'Components/Admin/ListPageTemplate'

import TransformGridGetRowsParams from 'Utils/TransformGridGetRowsParams'

import useDebounce from 'Hooks/useDebounce'

import AssetFindManyApi, { AssetFindManySingleOutput } from 'Api/Asset/AssetFindManyApi'

const AssetList: FC = () => {
	const [SearchParams, SetSearchParams] = useSearchParams()

	const [FilterSearch, SetFilterSearch] = useState(() => SearchParams.get('search') ?? '')
	const [FilterStatus, SetFilterStatus] = useState<AssetStatus | ''>(() => {
		const statusParam = SearchParams.get('status')

		if (statusParam && Object.values(AssetStatus).includes(statusParam as AssetStatus)) {
			return statusParam as AssetStatus
		}

		return ''
	})

	const ListPageTemplateRef = useRef<ListPageTemplateHandle>(null)

	const Navigate = useNavigate()

	const { t } = useTranslation('admin_assets')

	const OnFilterReset = useCallback(() => {
		SetFilterSearch('')
		SetFilterStatus('')
	}, [])

	const Columns = useMemo<GridColDef<AssetFindManySingleOutput>[]>(
		() => [
			{
				field: 'name',
				headerName: t('admin_assets:name'),
				width: 300,
				filterable: false,
			},
			{
				field: 'category',
				headerName: t('admin_assets:category'),
				width: 200,
				filterable: false,
				valueGetter: (_, row) => row.category.name,
			},
			{
				field: 'requiresApproval',
				headerName: t('admin_assets:requiresApproval'),
				width: 100,
				filterable: false,
				valueGetter: (_, row) => (row.requiresApproval ? t('common:yes') : t('common:no')),
			},
			{
				field: 'status',
				headerName: t('admin_assets:status'),
				width: 100,
				filterable: false,
				valueGetter: (_, row) => t(`admin_assets:enums.status.${row.status}`),
			},
			{
				field: 'description',
				headerName: t('admin_assets:description'),
				minWidth: 300,
				flex: 1,
				filterable: false,
			},
			{
				field: 'actions',
				type: 'actions',
				width: 80,
				getActions: params => [
					<GridActionsCellItem
						key='seeDetail'
						icon={<VisibilityIcon />}
						label={t('common:seeDetail')}
						onClick={() => Navigate(params.row.id)}
					/>,
					<GridActionsCellItem
						key='edit'
						icon={<EditIcon />}
						label={t('common:edit')}
						onClick={() => Navigate(`${params.row.id}/edit`)}
					/>,
				],
			},
		],
		[Navigate, t],
	)

	const debouncedFilterSearch = useDebounce(FilterSearch, 500)
	const debouncedFilterStatus = useDebounce(FilterStatus, 500)

	const OnRefreshData = useCallback(
		() => {
			SetSearchParams(prev => {
				if (debouncedFilterSearch !== '') prev.set('search', debouncedFilterSearch)
				else prev.delete('search')

				if (debouncedFilterStatus !== '') prev.set('status', debouncedFilterStatus)
				else prev.delete('status')

				return prev
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[debouncedFilterSearch],
	)

	const AssetDataSource = useMemo<GridDataSource>(
		() => ({
			getRows: async (params: GridGetRowsParams): Promise<GridGetRowsResponse> => {
				const result = await AssetFindManyApi({
					...TransformGridGetRowsParams<AssetSortField>(params),
					search: debouncedFilterSearch,
					...(debouncedFilterStatus === '' ? {} : { status: [debouncedFilterStatus] }),
				})

				OnRefreshData()

				return { rows: result.list, rowCount: result.pagination.total }
			},
		}),
		[OnRefreshData, debouncedFilterSearch, debouncedFilterStatus],
	)

	return (
		<ListPageTemplate
			ref={ListPageTemplateRef}
			title={t('admin_assets:list.title')}
			dataSource={AssetDataSource}
			columns={Columns}
			sortFieldEnum={AssetSortField}
			onFilterReset={OnFilterReset}
			filterSlot={
				<>
					<TextField
						id='search'
						label={t('common:search')}
						variant='outlined'
						value={FilterSearch}
						onChange={event => SetFilterSearch(event.target.value)}
						sx={{ minWidth: 200 }}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position='start'>
										<SearchIcon />
									</InputAdornment>
								),
							},
						}}
					/>
					<TextField
						select
						label={t('admin_assets:status')}
						value={FilterStatus}
						onChange={event => SetFilterStatus(event.target.value as AssetStatus)}
						sx={{ minWidth: 200 }}
					>
						<MenuItem value=''>{t('common:all')}</MenuItem>
						{Object.entries(AssetStatus).map(([key, value]) => (
							<MenuItem key={key} value={value}>
								{t(`admin_assets:enums.status.${value}`)}
							</MenuItem>
						))}
					</TextField>
				</>
			}
		/>
	)
}

export default AssetList

export { AssetList as Component }
