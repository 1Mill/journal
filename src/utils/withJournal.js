export const withJournal = async (cloudevent = {}, ctx = {}, { func, journal }) => {
	if (!journal) { throw new Error('Journal must exist.') }

	// * To reuse database connections between invocations, we must stop
	// * AWS from closing the connection. This way, the connection remains
	// * open and ready for immediate use whenever the next cloudevent
	// * comes in.
	// * https://www.mongodb.com/docs/atlas/manage-connections-aws-lambda/#manage-connections-with-aws-lambda
	ctx.callbackWaitsForEmptyEventLoop = false

	try {
		const { skip } = await journal.entry({ cloudevent })
		if (skip) { return }

		return func(cloudevent, ctx)
	} catch (err) {
		await journal.erase({ cloudevent })
		throw err
	}
}
