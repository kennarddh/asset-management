import { FC, useCallback, useMemo, useState } from 'react'

import SearchIcon from '@mui/icons-material/Search'

import { InputAdornment, TextField } from '@mui/material'
import {
	GridColDef,
	GridDataSource,
	GridGetRowsParams,
	GridGetRowsResponse,
} from '@mui/x-data-grid'

import { ApiErrorKind, ApiErrorResource, AssetCategorySortField } from '@asset-management/common'
import { useTranslation } from 'react-i18next'

import HandleApiError from 'Utils/HandleApiError'
import TransformGridGetRowsParams from 'Utils/TransformGridGetRowsParams'

import useDebounce from 'Hooks/useDebounce'

import AssetCategoryFindByIdApi from 'Api/Asset/Category/AssetCategoryFindByIdApi'
import AssetCategoryFindManyApi, {
	AssetCategoryFindManySingleOutput,
} from 'Api/Asset/Category/AssetCategoryFindManyApi'

import SelectTemplate from './SelectTemplate'
import { SelectResourceProps } from './Types'

const SelectAssetCategory: FC<SelectResourceProps> = props => {
	const [FilterSearch, SetFilterSearch] = useState('')

	const { t } = useTranslation('admin_assetCategories')

	const OnFilterReset = useCallback(() => {
		SetFilterSearch('')
	}, [])

	const GetRowById = useCallback(
		async (id: string) => {
			try {
				return await AssetCategoryFindByIdApi({ id })
			} catch (error) {
				const errorText = await HandleApiError(error, async error => {
					if (
						error.resource === ApiErrorResource.AssetCategory &&
						error.kind === ApiErrorKind.NotFound
					) {
						return t('admin_assetCategories:errors.notFound')
					}
				})

				props.onError(errorText)
			}
		},
		[props, t],
	)

	const Columns = useMemo<GridColDef<AssetCategoryFindManySingleOutput>[]>(
		() => [
			{
				field: 'name',
				headerName: t('admin_assetCategories:name'),
				width: 300,
				filterable: false,
			},

			{
				field: 'description',
				headerName: t('admin_assetCategories:description'),
				filterable: false,
				sortable: false,
				minWidth: 200,
				flex: 1,
			},
		],
		[t],
	)

	const debouncedFilterSearch = useDebounce(FilterSearch, 500)

	const AssetCategoryDataSource = useMemo<GridDataSource>(
		() => ({
			getRows: async (params: GridGetRowsParams): Promise<GridGetRowsResponse> => {
				const result = await AssetCategoryFindManyApi({
					...TransformGridGetRowsParams<AssetCategorySortField>(params),
					search: debouncedFilterSearch,
				})

				return { rows: result.list, rowCount: result.pagination.total }
			},
		}),
		[debouncedFilterSearch],
	)

	return (
		<SelectTemplate
			disabled={!!props.disabled}
			getButtonLabel={selectedLabel =>
				selectedLabel ?? t('admin_assetCategories:select.button')
			}
			title={t('admin_assetCategories:select.title')}
			dataSource={AssetCategoryDataSource}
			columns={Columns}
			sortFieldEnum={AssetCategorySortField}
			selectedRowId={props.value}
			onRowSelected={props.onChange}
			getRowLabel={row => row.name as string}
			slotProps={props.slotProps ?? {}}
			getRowById={GetRowById}
			ref={props.ref}
			shrinkedText={props.shrinkedText ?? null}
			onFilterReset={OnFilterReset}
			filterSlot={
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
			}
		/>
	)
}

export default SelectAssetCategory
