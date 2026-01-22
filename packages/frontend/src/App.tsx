import { FC, Suspense, useMemo } from 'react'

import { RouterProvider, createBrowserRouter } from 'react-router'

import { ThemeProvider, createTheme } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import { UserRole } from '@asset-management/common'
import AdminDashboardLayout from 'Outlets/AdminDashboardLayout'
import AuthorizationOutlet from 'Outlets/AuthorizationOutlet'
import HasRoleOutlet from 'Outlets/HasRoleOutlet'
import MainLayout from 'Outlets/MainLayout'
import MemberLayout from 'Outlets/MemberLayout'
import { useTranslation } from 'react-i18next'

import PromptProvider from 'Contexts/Prompt'

import MUILocaleMap, { DefaultMUILocale } from 'Constants/MUILocaleMap'

import ErrorPage from 'Pages/ErrorPage'
import LoadingPage from 'Pages/LoadingPage'

const router = createBrowserRouter([
	{
		element: <MainLayout />,
		hydrateFallbackElement: <LoadingPage />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <AuthorizationOutlet />,
				children: [
					{
						path: '',
						element: <HasRoleOutlet role={UserRole.Member} />,
						children: [
							{
								path: '',
								element: <MemberLayout />,
								children: [
									{
										index: true,
										lazy: () => import('Pages/Member/Home'),
									},
									{
										path: 'assets',
										children: [
											{
												index: true,
												lazy: () => import('Pages/Member/Assets'),
											},
											{
												path: ':id',
												lazy: () => import('Pages/Member/AssetDetail'),
											},
										],
									},
									{
										path: 'my-orders',
										children: [
											{
												index: true,
												lazy: () => import('Pages/Member/MyOrders'),
											},
											{
												path: ':id',
												lazy: () => import('Pages/Member/OrderDetail'),
											},
										],
									},
								],
							},
						],
					},
					{
						path: '/admin',
						element: <HasRoleOutlet role={UserRole.Admin} />,
						children: [
							{
								path: '',
								element: <AdminDashboardLayout />,
								children: [
									{
										index: true,
										lazy: () => import('Pages/Admin/Home'),
									},
									{
										path: 'user',
										children: [
											{
												index: true,
												lazy: () => import('Pages/Admin/User/UserList'),
											},
											{
												path: ':id',
												children: [
													{
														index: true,
														lazy: () =>
															import('Pages/Admin/User/UserDetail'),
													},
													{
														path: 'edit',
														lazy: () =>
															import('Pages/Admin/User/EditUser'),
													},
												],
											},
											{
												path: 'session',
												children: [
													{
														index: true,
														lazy: () =>
															import('Pages/Admin/UserSession/UserSessionList'),
													},
													{
														path: ':id',
														lazy: () =>
															import('Pages/Admin/UserSession/UserSessionDetail'),
													},
												],
											},
										],
									},
									{
										path: 'asset',
										children: [
											{
												index: true,
												lazy: () => import('Pages/Admin/Asset/AssetList'),
											},
											{
												path: 'new',
												lazy: () => import('Pages/Admin/Asset/NewAsset'),
											},
											{
												path: ':id',
												children: [
													{
														index: true,
														lazy: () =>
															import('Pages/Admin/Asset/AssetDetail'),
													},
													{
														path: 'edit',
														lazy: () =>
															import('Pages/Admin/Asset/EditAsset'),
													},
												],
											},
											{
												path: 'category',
												children: [
													{
														index: true,
														lazy: () =>
															import('Pages/Admin/AssetCategory/AssetCategoryList'),
													},
													{
														path: 'new',
														lazy: () =>
															import('Pages/Admin/AssetCategory/NewAssetCategory'),
													},
													{
														path: ':id',
														children: [
															{
																index: true,
																lazy: () =>
																	import('Pages/Admin/AssetCategory/AssetCategoryDetail'),
															},
															{
																path: 'edit',
																lazy: () =>
																	import('Pages/Admin/AssetCategory/EditAssetCategory'),
															},
														],
													},
												],
											},
										],
									},
									{
										path: 'order',
										children: [
											{
												index: true,
												lazy: () => import('Pages/Admin/Order/OrderList'),
											},
											{
												path: ':id',
												lazy: () => import('Pages/Admin/Order/OrderDetail'),
											},
										],
									},
								],
							},
						],
					},
				],
			},
			{
				path: 'login',
				element: <AuthorizationOutlet forNonLoggedIn />,
				children: [{ index: true, lazy: () => import('Pages/Login') }],
			},
			{
				path: 'register',
				element: <AuthorizationOutlet forNonLoggedIn />,
				children: [{ index: true, lazy: () => import('Pages/Register') }],
			},
		],
	},
])

const App: FC = () => {
	const { i18n } = useTranslation()

	const theme = useMemo(() => {
		const currentMUILocale = Object.keys(MUILocaleMap).includes(i18n.language)
			? MUILocaleMap[i18n.language as keyof typeof MUILocaleMap]
			: DefaultMUILocale

		return createTheme(
			{},
			currentMUILocale.dataGrid,
			currentMUILocale.datePicker,
			currentMUILocale.material,
		)
	}, [i18n.language])

	return (
		<Suspense fallback={<LoadingPage />}>
			<ThemeProvider theme={theme} noSsr>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<PromptProvider>
						<RouterProvider router={router} />
					</PromptProvider>
				</LocalizationProvider>
			</ThemeProvider>
		</Suspense>
	)
}

export default App
