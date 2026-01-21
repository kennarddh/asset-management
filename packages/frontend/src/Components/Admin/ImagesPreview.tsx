import { FC } from 'react'

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import CloseIcon from '@mui/icons-material/Close'

import { Avatar, Box, IconButton, Stack } from '@mui/material'

export interface ImagesPreviewActiveProps {
	onAddGalleryImage: () => void
	onRemoveGalleryImage: (index: number) => void
	images: { url: string }[]
	disabled?: false
}

export interface ImagesPreviewDisabledProps {
	onAddGalleryImage?: never
	onRemoveGalleryImage?: never
	images: { url: string }[]
	disabled: true
}

export type ImagesPreviewProps = ImagesPreviewActiveProps | ImagesPreviewDisabledProps

const ImagesPreview: FC<ImagesPreviewProps> = props => {
	return (
		<Stack direction='row' spacing={2} sx={{ p: 1 }}>
			{props.images.map(({ url }, index) => (
				<Box
					key={index}
					sx={{
						position: 'relative',
						width: 100,
						height: 100,
					}}
				>
					<Avatar
						src={url}
						alt={`preview ${index}`}
						variant='rounded'
						sx={{ width: '100%', height: '100%' }}
					/>
					{props.disabled ? null : (
						<IconButton
							size='small'
							onClick={() => props.onRemoveGalleryImage(index)}
							sx={{
								position: 'absolute',
								top: 4,
								right: 4,
								backgroundColor: 'rgba(255, 255, 255, 0.7)',
								'&:hover': {
									backgroundColor: 'rgba(255, 255, 255, 1)',
								},
							}}
						>
							<CloseIcon fontSize='small' />
						</IconButton>
					)}
				</Box>
			))}
			{props.disabled ? null : (
				<Box
					onClick={props.onAddGalleryImage}
					sx={{
						width: 100,
						height: 100,
						borderRadius: 2,
						border: '2px dashed',
						borderColor: 'divider',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						'&:hover': {
							backgroundColor: 'action.hover',
							borderColor: 'primary.main',
						},
					}}
				>
					<AddPhotoAlternateIcon color='action' />
				</Box>
			)}
		</Stack>
	)
}

export default ImagesPreview
