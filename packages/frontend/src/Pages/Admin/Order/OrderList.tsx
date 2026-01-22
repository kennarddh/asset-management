import { FC, useCallback, useMemo, useRef, useState } from 'react'

import { useNavigate, useSearchParams } from 'react-router'

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

import { OrderSortField, OrderStatus } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import ListPageTemplate, { ListPageTemplateHandle } from 'Components/Admin/ListPageTemplate'

import TransformGridGetRowsParams from 'Utils/TransformGridGetRowsParams'

import useDebounce from 'Hooks/useDebounce'

import OrderFindManyApi, { OrderFindManySingleOutput } from 'Api/Order/OrderFindManyApi'

const OrderList: FC = () => {
	const [SearchParams, SetSearchParams] = useSearchParams()

	const [FilterSearch, SetFilterSearch] = useState(() => SearchParams.get('search') ?? '')
	const [FilterStatus, SetFilterStatus] = useState<OrderStatus | ''>(() => {
		const statusParam = SearchParams.get('status')

		if (statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
			return statusParam as OrderStatus
		}

		return ''
	})

	const ListPageTemplateRef = useRef<ListPageTemplateHandle>(null)

	const Navigate = useNavigate()

	const { t } = useTranslation('admin_orders')

	const OnFilterReset = useCallback(() => {
		SetFilterSearch('')
		SetFilterStatus('')
	}, [])

	const Columns = useMemo<GridColDef<OrderFindManySingleOutput>[]>(
		() => [
			{
				field: 'user',
				headerName: t('admin_orders:user'),
				width: 150,
				filterable: false,
				sortable: false,
				valueGetter: (_, row) => row.user.name,
			},
			{
				field: 'asset',
				headerName: t('admin_orders:asset'),
				width: 250,
				filterable: false,
				sortable: false,
				valueGetter: (_, row) => row.asset.name,
			},
			{
				field: 'status',
				headerName: t('admin_orders:status'),
				width: 100,
				filterable: false,
				valueGetter: (_, row) => t(`admin_orders:enums.status.${row.status}`),
			},
			{
				field: 'description',
				headerName: t('admin_orders:description'),
				minWidth: 300,
				filterable: false,
			},
			{
				field: 'reason',
				headerName: t('admin_orders:reason'),
				minWidth: 300,
				filterable: false,
			},
			{
				field: 'requestedAt',
				headerName: t('admin_orders:requestedAt'),
				filterable: false,
				minWidth: 250,
				valueFormatter: (value: Date) => t('common:dateTime', { date: value }),
			},
			{
				field: 'startAt',
				headerName: t('admin_orders:startAt'),
				filterable: false,
				minWidth: 250,
				valueFormatter: (value: Date) => t('common:dateTime', { date: value }),
			},
			{
				field: 'finishAt',
				headerName: t('admin_orders:finishAt'),
				filterable: false,
				minWidth: 250,
				flex: 1,
				valueFormatter: (value: Date) => t('common:dateTime', { date: value }),
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
		[debouncedFilterSearch, debouncedFilterStatus],
	)

	const OrderDataSource = useMemo<GridDataSource>(
		() => ({
			getRows: async (params: GridGetRowsParams): Promise<GridGetRowsResponse> => {
				const result = await OrderFindManyApi({
					...TransformGridGetRowsParams<OrderSortField>(params),
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
			title={t('admin_orders:list.title')}
			dataSource={OrderDataSource}
			columns={Columns}
			sortFieldEnum={OrderSortField}
			onFilterReset={OnFilterReset}
			cannotBeCreated
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
						label={t('admin_orders:status')}
						value={FilterStatus}
						onChange={event => SetFilterStatus(event.target.value as OrderStatus)}
						sx={{ minWidth: 200 }}
					>
						<MenuItem value=''>{t('common:all')}</MenuItem>
						{Object.entries(OrderStatus).map(([key, value]) => (
							<MenuItem key={key} value={value}>
								{t(`admin_orders:enums.status.${value}`)}
							</MenuItem>
						))}
					</TextField>
				</>
			}
		/>
	)
}

export default OrderList

export { OrderList as Component }
