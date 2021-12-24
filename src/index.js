const { Mongo } = require('@1mill/mongo')

const MONGODB_DUPLICATE_ERROR_CODE = Object.freeze(11000)

const fetchNodeEnv = name => process && process.env && process.env[name]

class Journal {
	constructor({
		name = fetchNodeEnv('MILL_JOURNAL_NAME'),
		options = {},
		table = fetchNodeEnv('MILL_JOURNAL_TABLE'),
		uri = fetchNodeEnv('MILL_JOURNAL_URI'),
	}) {
		// * Arguments
		this.name = name
		if (!this.name) throw new Error('Journal "name" is required')

		this.options = options

		this.table = table
		if (!this.table) throw new Error('Journal "table" is required')

		this.uri = uri
		if (!this.uri) throw new Error('Journal "uri" is required')


		// * State and connection management
		this.mongoConnectPromise = undefined
	}

	async entry({ cloudevent }) {
		if (typeof this.mongoConnectPromise === 'undefined') {
			this.mongoConnectPromise = new Mongo({
				db: this.name,
				options: this.options,
				uri: this.uri,
			}).connect()
		}

		const { db } = await this.mongoConnectPromise
		const collection = db.collection(this.table)

		await collection.createIndex({ id: 1, source: 1, type: 1 }, { unique: true })

		let skip = false
		try {
			// ! Create and pass in new object to not mutate original reference
			// * Will fail on duplicate because of unique index
			await collection.insertOne({ ...cloudevent })
		} catch(err) {
			if (err.code !== MONGODB_DUPLICATE_ERROR_CODE) throw err
			skip = true
		}
		return { skip }
	}

	async erase({ cloudevent }) {
		if (typeof this.mongoConnectPromise === 'undefined') {
			this.mongoConnectPromise = new Mongo({
				db: this.name,
				options: this.options,
				uri: this.uri,
			}).connect()
		}

		const { db } = await this.mongoConnectPromise
		const collection = db.collection(this.table)

		const { id, source, type } = cloudevent
		await collection.deleteMany({ id, source, type })
	}
}

module.exports =  { Journal }
