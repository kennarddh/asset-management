import { ChangeEvent, FC, useCallback } from 'react'

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import CloseIcon from '@mui/icons-material/Close'

import { Avatar, Box, Button, IconButton, Stack } from '@mui/material'

export interface ImagesPreviewActiveProps {
	onAddImages: (files: File[]) => void
	onRemoveImage: (index: number) => void
	images: { url: string }[]
	disabled?: false
}

export interface ImagesPreviewDisabledProps {
	onAddImages?: never
	onRemoveImage?: never
	images: { url: string }[]
	disabled: true
}

export type ImagesPreviewProps = ImagesPreviewActiveProps | ImagesPreviewDisabledProps

const ImagesPreview: FC<ImagesPreviewProps> = props => {
	const OnFileChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (event.target.files === null) return

			const files = [...event.target.files]

			if (files.length > 0) {
				props.onAddImages?.(files)

				event.target.value = ''
			}
		},
		[props],
	)

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
							onClick={() => props.onRemoveImage(index)}
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
				<Button
					component='label'
					variant='contained'
					tabIndex={-1}
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
					<input
						style={{
							clip: 'rect(0 0 0 0)',
							clipPath: 'inset(50%)',
							height: 1,
							overflow: 'hidden',
							position: 'absolute',
							bottom: 0,
							left: 0,
							whiteSpace: 'nowrap',
							width: 1,
						}}
						type='file'
						multiple
						onChange={OnFileChange}
						accept="image/jpeg, image/png, image/webp, image/avif"
					/>
				</Button>
			)}
		</Stack>
	)
}

export default ImagesPreview
