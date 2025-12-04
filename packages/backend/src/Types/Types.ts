/* eslint-disable @typescript-eslint/no-explicit-any */

export type FilteredStringUnionPrefix<
	T extends string,
	Prefix extends string,
> = T extends `${Prefix}${string}` ? T : never

export type FilteredStringUnionNotPrefix<
	T extends string,
	Prefix extends string,
> = T extends `${Prefix}${string}` ? never : T

export type FilteredStringUnionSuffix<
	T extends string,
	Suffix extends string,
> = T extends `${string}${Suffix}` ? T : never

export type FilteredStringUnionNotSuffix<
	T extends string,
	Suffix extends string,
> = T extends `${string}${Suffix}` ? never : T

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type DeepPartialAndUndefined<T> = T extends Function
	? T
	: T extends Date
		? T
		: T extends object
			? T extends any[]
				? T
				: {
						[P in keyof T]?: DeepPartialAndUndefined<T[P]> | undefined
					}
			: T

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type DeepRemoveUndefined<T> = T extends Function
	? T
	: T extends Date
		? T
		: T extends object
			? T extends any[]
				? T
				: {
						[P in keyof T]: Exclude<DeepRemoveUndefined<T[P]>, undefined>
					}
			: T

export type UnpackArray<T> = T extends (infer U)[] ? U : T
