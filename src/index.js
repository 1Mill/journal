const { MongoClient } = require('mongodb')

class Journal {
	constructor({ db = {}, tableName }) {
		// * Inputs
		this.db = {
			name: db.name || process.env.JOURNAL_DB_NAME,
			options: db.options || {},
			uri: db.uri || process.env.JOURNAL_DB_URI,
		}
		this.tableName = tableName || process.env.JOURNAL_TABLE_NAME

		// * Database connections
		this.client = undefined

		// * Run immediately
		this._setupIndexes()
	}

	async _collection() {
		if (typeof this.client === 'undefined') {
			this.client = new MongoClient(this.db.uri, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				...this.db.options,
			})
			await this.client.connect()
		}
		const db = this.client.db(this.db.name)
		const collection = db.collection(this.tableName)
		return collection
	}

	async _setupIndexes() {
		const collection = await this._collection()

		// * Avoid duplicate Cloudevent entries to the Journal
		await collection.createIndex({ id: 1, source: 1, type: 1 }, { unique: true })

	}

	async entry({ cloudevent }) {
		const collection = await this._collection()

		let skip = null
		try {
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
