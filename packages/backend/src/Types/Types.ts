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
export type DeepPartialAndUndefined<T, K extends keyof T = never> = T extends Function
	? T
	: T extends Date
		? T
		: T extends object
			? T extends any[]
				? T
				: {
						[P in keyof T]?: P extends K
							? T[P] | undefined // If key is in K: Stop recursion, just make it optional
							: DeepPartialAndUndefined<T[P]> | undefined // If not in K: Recurse deeply
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
