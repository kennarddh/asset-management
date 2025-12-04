export class InvalidStateError extends Error {
	constructor(
		public operation: string,
		public state: string,
	) {
		super(`Operation "${operation}" is not valid in state "${state}".`)
	}
}

export class ResourceNotFoundError extends Error {
	constructor(public resource?: string) {
		super(`Resource '${resource}' not found`)
	}
}

export class DataAccessError extends Error {
	constructor() {
		super('Failed accessing data')
	}
}

export class UnauthorizedError extends Error {
	constructor() {
		super('Unauthorized')
	}
}
