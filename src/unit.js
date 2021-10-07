const { Journal } = require('./index')

const journal = new Journal({
	name: 'journal',
	table: 'some-string',
	uri: 'mongodb://root:password@localhost:27017/',
})

const main = async () => {
	console.log('Starting...')
	const { skip } = await journal.entry({
		cloudevent: {
			id: '123',
			source: 'abc',
			type: 'aaa',
		}
	})
	console.log('Skip event? ', skip)
}
main()
