const { Mongo } = require('@1mill/mongo')

const fetchNodeEnv = name => process && process.env && process.env[name]

class Journal {
	constructor({
		name = fetchNodeEnv('MILL_JOURNAL_NAME'),
		options = {},
		table = fetchNodeEnv('MILL_JOURNAL_TABLE'),
		type = fetchNodeEnv('MILL_JOURNAL_TYPE'),
		uri = fetchNodeEnv('MILL_JOURNAL_URI'),
	}) {
		// * Arguments
		this.name = name
		this.options = options
		this.table = table
		this.type = type
		this.uri = uri

		// * State and connection management
		this.mongo = undefined
	}

	async entry({ cloudevent }) {
		if (typeof this.mongo === 'undefined') {
			this.mongo = new Mongo({
				db: this.name,
				options: this.options,
				uri: this.uri,
			})
		}

		const { db } = await this.mongo.connect()
		const collection = db.collection(this.table)

		await collection.createIndex({ id: 1, source: 1, type: 1 }, { unique: true })

		let skip = false
		try {
			// ! Create and pass in new object to not mutate original reference
			// * Will fail on duplicate because of unique index
			await collection.insertOne({ ...cloudevent })
		} catch(_err) {
			skip = true
		}
		return { skip }
	}
}

module.exports =  { Journal }
