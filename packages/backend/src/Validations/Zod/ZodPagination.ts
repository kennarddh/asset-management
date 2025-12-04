import { z } from 'zod/v4'

const ZodPagination = z.object({
	page: z.coerce.number().min(0).optional(),
	limit: z.coerce.number().min(0).optional(),
})

export default ZodPagination
