# TODO

- Individual asset tracking
- Image and video upload with object storage
- Web push notification

POST /order -> Member

- Create order entry
- Schedule auto cancel at startAt
- Send notification to admin

POST /order/:id/approve -> Admin

- Send notification to member
- Update order status to `Approved`, approvedAt, reason.
- Schedule on finishAt to update status to `Overdue`.
- Schedule on startAt to update status to `Active`.

POST /order/:id/reject -> Admin

- Send notification to member
- Update order status, rejectedAt, reason

POST /order/:id/cancel -> Member

- Check whether has started
- Update order status, canceledAt

POST /order/:id/return -> Admin

- Send notification to member
- Check whether has started
- Update order status, returnedAt. If returned late update status to `ReturnedLate`, else `Returned`.

GET /order -> Admin

- Find many order

GET /order/self -> Member

- Find many order but ordered by the user that initiated the request.
