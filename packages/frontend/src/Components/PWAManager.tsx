import { FC, useCallback, useEffect, useState } from 'react'

import { useRegisterSW } from 'virtual:pwa-register/react'

const PWAManager: FC = () => {
	const [HasOfflineReadyModalShown, SetHasOfflineReadyModalShown] = useState<boolean>(
		() => localStorage.getItem('hasOfflineReadyModalShown') === '1',
	)

	const { CloseModal, IsOpen, QueueOpenModal } = useModal()

	const {
		offlineReady: [OfflineReady, SetOfflineReady],
		needRefresh: [NeedRefresh, SetNeedRefresh],
		updateServiceWorker: UpdateServiceWorker,
	} = useRegisterSW({
		onRegistered(registration) {
			console.log('Service worker registered', registration)
		},
		onRegisteredSW(swUrl, registration) {
			if (registration !== undefined) {
				setInterval(
					async () => {
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						if (registration.installing || !navigator) return

						if ('connection' in navigator && !navigator.onLine) return

						const resp = await fetch(swUrl, {
							cache: 'no-store',
							headers: {
								cache: 'no-store',
								'cache-control': 'no-cache',
							},
						})

						if (resp.status === 200) await registration.update()
					},
					60 * 60 * 1000,
				)
			}
		},
		onRegisterError(error) {
			console.log('Service worker registration error', error)

			QueueOpenModal({
				title: 'PWA Error',
				description: 'Service worker failed to register.',
			})
		},
	})

	const Close = useCallback(() => {
		SetOfflineReady(false)
		SetNeedRefresh(false)
		CloseModal()
	}, [SetOfflineReady, SetNeedRefresh, CloseModal])

	useEffect(() => {
		if (!OfflineReady) return
		if (IsOpen) return
		if (HasOfflineReadyModalShown) return

		SetHasOfflineReadyModalShown(true)

		QueueOpenModal({
			title: 'Offline Ready',
			description: 'App is ready to work offline',
		})
	}, [OfflineReady, QueueOpenModal, IsOpen, HasOfflineReadyModalShown])

	useEffect(() => {
		if (!NeedRefresh) return
		if (IsOpen) return

		QueueOpenModal({
			title: 'An update is available.',
			description: [
				{
					id: 'reload',
					text: '"Reload" will refresh the app. You may lose the progress, if any.',
				},
				{
					id: 'cancel',
					text: '"Cancel" will install the update next time you visit the app.',
				},
			],
			buttons: [
				{
					id: 'close',
					text: 'Close',
					onClick: Close,
					submit: false,
				},
				{
					id: 'reload',
					text: 'Reload',
					onClick: UpdateServiceWorker,
					submit: false,
				},
			],
			defaultCloseButton: false,
		})
	}, [Close, NeedRefresh, QueueOpenModal, UpdateServiceWorker, IsOpen])

	useEffect(() => {
		localStorage.setItem('hasOfflineReadyModalShown', HasOfflineReadyModalShown ? '1' : '0')
	}, [HasOfflineReadyModalShown])

	useEffect(() => {
		if (!OfflineReady) SetHasOfflineReadyModalShown(false)
	}, [OfflineReady])

	return null
}

export default PWAManager
