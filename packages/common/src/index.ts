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
	Asset = 'Asset',
	AssetCategory = 'AssetCategory',
	Order = 'Order',
	Location = 'Location',
	Username = 'Username',
	Duration = 'Duration',
	DateTime = 'DateTime',
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
	Processed = 'Processed',
	Unavailable = 'Unavailable',
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

export enum AssetSortField {
	Name = 'name',
	Description = 'description',
	MaximumLendingDuration = 'maximumLendingDuration',
	MinimumLendingDuration = 'minimumLendingDuration',
	RequiresApproval = 'requiresApproval',
	Status = 'status',
	CreatedAt = 'createdAt',
}

export enum AssetCategorySortField {
	Name = 'name',
	Description = 'description',
	CreatedAt = 'createdAt',
}

export enum OrderSortField {
	Description = 'description',
	Status = 'status',
	RequestedAt = 'requestedAt',
	UpdatedAt = 'updatedAt',
	FinishAt = 'finishAt',
	StartAt = 'startAt',
	ApprovedAt = 'approvedAt',
	RejectedAt = 'rejectedAt',
	ReturnedAt = 'returnedAt',
	CanceledAt = 'canceledAt',
}

export enum AssetStatus {
	Available = 'Available',
	Delisted = 'Delisted',
}

export enum OrderStatus {
	Pending = 'Pending',
	Approved = 'Approved',
	Rejected = 'Rejected',
	Canceled = 'Canceled',
	Active = 'Active',
	Overdue = 'Overdue',
	Returned = 'Returned',
	ReturnedLate = 'ReturnedLate',
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
