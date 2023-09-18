import { emitWarning } from 'node:process'

export const warning = (message) => {
	emitWarning(message, undefined, '@1mill/journal')
}
