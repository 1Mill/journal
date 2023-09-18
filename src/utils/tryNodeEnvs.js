export const tryNodeEnvs = (strings = [], fallback) => {
	strings.forEach(s => {
		const value = process?.env?.[s]
		if (typeof value !== 'undefined') { return value }
	})

	return fallback
}
