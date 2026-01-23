import { OrderStatus } from '@asset-management/common'

const OrderStatusToColor: Record<
	OrderStatus,
	'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
	[OrderStatus.Pending]: 'info',
	[OrderStatus.Approved]: 'primary',
	[OrderStatus.Rejected]: 'error',
	[OrderStatus.Canceled]: 'warning',
	[OrderStatus.Active]: 'success',
	[OrderStatus.Overdue]: 'error',
	[OrderStatus.Returned]: 'success',
	[OrderStatus.ReturnedLate]: 'warning',
}

export default OrderStatusToColor
