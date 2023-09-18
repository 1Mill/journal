export const withIdempotency = async (cloudevent = {}, ctx = {}, { func, journal, locker }) => {
	// * To reuse database connections between invocations, we must stop
	// * AWS from closing the connection. This way, the connection remains
	// * open and ready for immediate use whenever the next cloudevent
	// * comes in.
	// * https://www.mongodb.com/docs/atlas/manage-connections-aws-lambda/#manage-connections-with-aws-lambda
	ctx.callbackWaitsForEmptyEventLoop = false

	try {
		const { skip } = await (journal || locker).lock({ cloudevent })
		if (skip) { return }

		return func(cloudevent, ctx)
	} catch (err) {
		await journal.unlock({ cloudevent })
		throw err
	}
}
