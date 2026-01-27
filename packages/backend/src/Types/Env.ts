export interface ProcessEnvVariables {
	NODE_ENV: string

	HOST: string
	PORT: string

	DATABASE_URL?: string
	DATABASE_URL_FILE?: string

	ACCESS_TOKEN_SECRET?: string
	ACCESS_TOKEN_SECRET_FILE?: string
	ACCESS_TOKEN_EXPIRE: string
	ACCESS_TOKEN_CLOCK_TOLERANCE: string

	REFRESH_TOKEN_SECRET?: string
	REFRESH_TOKEN_SECRET_FILE?: string
	REFRESH_TOKEN_EXPIRE: string
	REFRESH_TOKEN_CLOCK_TOLERANCE: string

	RATE_LIMITER_MAX: string
	RATE_LIMITER_WINDOW: string

	PASSWORD_HASH_SECRET?: string
	PASSWORD_HASH_SECRET_FILE?: string

	CORS_ORIGIN: string

	LOG_LEVEL: string
	LOG_PATH: string

	BASE_URL: string
	IMAGE_BASE_URL: string

	PAGINATION_DEFAULT_LIMIT: string
	PAGINATION_DEFAULT_MAX_LIMIT: string

	REDIS_HOST: string
	REDIS_PORT: string
	REDIS_USERNAME: string
	REDIS_PASSWORD?: string
	REDIS_PASSWORD_FILE?: string
	REDIS_DB?: string

	S3_ENDPOINT: string
	S3_ACCESS_KEY?: string
	S3_ACCESS_KEY_FILE?: string
	S3_SECRET_KEY?: string
	S3_SECRET_KEY_FILE?: string
	S3_REGION: string
	S3_BUCKET_PROFILES: string
	S3_BUCKET_ASSETS: string

	IMAGE_USER_PROFILE_MAX_WIDTH?: string
	IMAGE_ASSET_IMAGE_MAX_WIDTH?: string
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface ProcessEnv extends ProcessEnvVariables {}
	}
}
