import { Journal, withJournal } from './index.js'

const journal = new Journal({
	name: 'journal',
	table: 'some-string',
	uri: 'mongodb://root:password@mongo:27017/',
})

const main = async () => {
	console.log('Starting...')

	const promises = [...Array(1_000)].map(async (_, i) => {
		const cloudevent = {
			id: i % 5,
			source: 'abc',
			type: 'aaa',
		}

		return withJournal(cloudevent, {}, {
			func: (cloudevent, ctx) => console.log('Running: ', cloudevent),
			journal,
		})
	})
	await Promise.all(promises)

	console.log('Finished')
}

main()
