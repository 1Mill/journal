const { MongoClient } = require('mongodb')

const SUPPORTED_TYPES = ['mongodb']

const fetchNodeEnv = name => process && process.env && process.env[name]

class Journal {
	constructor({ name, options = {}, table, type, uri }) {
		this.name = name || fetchNodeEnv('1MILL_JOURNAL_NAME')
		if (!this.name) throw new Error('Journal "name" is required')

		this.options = options

		this.table = table || fetchNodeEnv('1MILL_JOURNAL_TABLE')
		if (!this.table) throw new Error('Journal "table" is required')

		this.type = type || fetchNodeEnv('1MILL_JOURNAL_TYPE')
		if (!this.type) throw new Error('Journal "type" is required')
		if (!SUPPORTED_TYPES.includes(this.type)) throw new Error(`Journal "type" ${this.type} is not supported`)

		this.uri = uri || fetchNodeEnv('1MILL_JOURNAL_URI')
		if (!this.uri) throw new Error('Journal "uri" is required')

		// * Database connections
		this.client = undefined

		// * Run immediately
		if (!this.type === 'mongodb') this._setupMongoIndexes()
	}

	async _collection() {
		if (typeof this.client === 'undefined') {
			this.client = new MongoClient(this.uri, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				...this.options,
			})
			await this.client.connect()
		}
		const db = this.client.db(this.name)
		const collection = db.collection(this.table)
		return collection
	}

	async _setupMongoIndexes() {
		const collection = await this._collection()

		// * Avoid duplicate Cloudevent entries to the Journal
		await collection.createIndex({ id: 1, source: 1, type: 1 }, { unique: true })

	}

	async entry({ cloudevent }) {
		const collection = await this._collection()

		let skip = null
		try {
			// ! Create and pass in new object to not mutate original reference
			// * Will fail on duplicate because of unique index
			await collection.insertOne({ ...cloudevent })
			skip = false
		} catch (_err) {
			skip = true
		}

		return { skip }
	}

	async erase({ cloudevent }) {
		const collection = await this._collection()
		const { id, source, type } = cloudevent

		await collection.deleteMany({ id, source, type })
	}
}

module.exports = { Journal }
