import { warning } from './warning.js'
import { withIdempotency } from './withIdempotency.js'

export const withJournal = (...args) => {
	warning('"withJournal" is depricated and will be removed on the next major release, used "withIdempotency" instead.')
	return withIdempotency(...args)
}
