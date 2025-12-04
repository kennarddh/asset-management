export enum SortOrder {
	Ascending = 'asc',
	Descending = 'desc',
}

export enum ApiErrorResource {
	Endpoint = 'Endpoint',
	RateLimit = 'RateLimit',
	RefreshToken = 'RefreshToken',
	AccessToken = 'AccessToken',
	User = 'User',
	UserSession = 'UserSession',
	Username = 'Username',
}

export enum ApiErrorKind {
	NotFound = 'NotFound',
	Unauthorized = 'Unauthorized',
	Invalid = 'Invalid',
	Inactive = 'Inactive',
	Exceeded = 'Exceeded',
	Expired = 'Expired',
	Taken = 'Taken',
	CannotBeArray = 'CannotBeArray',
	InternalServerError = 'InternalServerError',
}

export interface ApiOtherError {
	resource: ApiErrorResource | null
	kind: ApiErrorKind
}

export enum UserSessionSortField {
	CreatedAt = 'createdAt',
	LastRefreshAt = 'lastRefreshAt',
	ExpireAt = 'expireAt',
}

export enum UserSortField {
	Name = 'name',
	CreatedAt = 'createdAt',
}

export enum ProductStatus {
	Available = 'Available',
	Delisted = 'Delisted',
}

export enum LendingRequestStatus {
	Pending = 'Pending',
	Approved = 'Approved',
	Rejected = 'Rejected',
	Cancelled = 'Cancelled',
	Active = 'Active',
	Completed = 'Completed',
	Overdue = 'Overdue',
}

export enum AssetType {
	Physical = 'Physical',
	Digital = 'Digital',
	Venue = 'Venue',
}

export enum UserRole {
	Admin = 'Admin',
	Member = 'Member',
}
