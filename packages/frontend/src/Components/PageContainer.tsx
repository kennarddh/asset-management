import { FC, ReactNode } from 'react'

import { Box, Typography } from '@mui/material'

export interface PageContainerProps {
	title: string
	children?: ReactNode
	hideTitle?: boolean
	noPadding?: boolean
}

const PageContainer: FC<PageContainerProps> = ({ title, children, hideTitle, noPadding }) => {
	return (
		<Box sx={{ width: '100%', height: '100%', padding: noPadding ? 0 : 2, overflowY: 'auto' }}>
			{hideTitle ? null : (
				<Typography variant='h5' component='h1' sx={{ mb: 2 }}>
					{title}
				</Typography>
			)}
			{children}
		</Box>
	)
}

export default PageContainer
