const { Journal } = require('./index')

const journal = new Journal({
	name: 'journal',
	table: 'some-string',
	uri: 'mongodb://root:password@mongo-able:27017/',
})

const main = async () => {
	console.log('Starting...')
	const promises = [...Array(1_000)].map(async (_, i) => {
		try {
			const { skip } = await journal.entry({
				cloudevent: {
					id: i % 5,
					source: 'abc',
					type: 'aaa',
				}
			})
			console.log(`Skip event? ${skip}`)
		} catch (err) {
			console.error(err)
		}
	})
	await Promise.allSettled(promises)
}
main()
