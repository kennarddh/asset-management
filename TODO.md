# TODO

- Individual asset tracking
- Image and video upload with object storage
- Web push notification
- Implement finite state machine for order's status transition instead of scattered logic in many methods.
- Refactor controller error handling by making error handling centralized and remove the need of putting standard error log of internal server error try catch in every controller.
- Refactor seed script to use password hash service.

- Create notification table. Make it store `payload` field which is the parameters for the notification template string. Has template key which is an enum for locale key of what kind of notification it is. Show notificaiton in app and also on push notification.
- Add SSE/WebSocket if the app is open to faster send the notification without web push processing delay.

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
