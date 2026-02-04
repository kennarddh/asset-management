import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('message', async event => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	if (event.data?.type === 'SKIP_WAITING') await self.skipWaiting()
})
