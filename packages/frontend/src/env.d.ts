/// <reference types="vite/client" />

// Declare env types here
interface ImportMetaEnv {
	readonly APP_API_SERVER_URL: string
}

interface ImportMeta {
	readonly env: Readonly<ImportMetaEnv>
}
