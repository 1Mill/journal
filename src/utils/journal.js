import { Mongo } from '@1mill/mongo'
import { addSeconds } from 'date-fns';
import { fetchNodeEnv } from './fetchNodeEnv.js';

const DEFAULT_EXPIRE_AFTER_SECONDS = Object.freeze(24 * 60 * 60) // * One day in seconds
const MONGODB_DUPLICATE_ERROR_CODE = Object.freeze(11000)
const TTL_KEY = Object.freeze('_expireAfter')

export class Journal {
	constructor({
		expireAfterSeconds = fetchNodeEnv('MILL_JOURNAL_EXPIRE_AFTER_SECONDS') || DEFAULT_EXPIRE_AFTER_SECONDS,
		name = fetchNodeEnv('MILL_JOURNAL_NAME'),
		options = {},
		table = fetchNodeEnv('MILL_JOURNAL_TABLE'),
		uri = fetchNodeEnv('MILL_JOURNAL_URI'),
	}) {
		// * Arguments
		this.expireAfterSeconds = expireAfterSeconds
		if (typeof this.expireAfterSeconds !== 'number') throw new Error('Journal "expireAfterSeconds" must be a number')
		if (this.expireAfterSeconds < 0) throw new Error('Journal "expireAfterSeconds" must be greater than or equal to zero')

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
		// * Create connection to database if it does not already exist.
		if (typeof this.mongoConnectPromise === 'undefined') {
			this.mongoConnectPromise = new Mongo({
				db: this.name,
				options: this.options,
				uri: this.uri,
			}).connect()
		}

		// * Fetch the database table.
		const { db } = await this.mongoConnectPromise
		const collection = db.collection(this.table)

		// * Create indexes on database table.
		await Promise.all([
			collection.createIndex({ [TTL_KEY]: 1 }, { expireAfterSeconds: 0 }),
			collection.createIndex({ id: 1, source: 1, type: 1 }, { unique: true }),
		])

		// * Check if this cloudevent has already been run.
		let skip = false
		try {
			// ! Do not mutate the original cloudevent, so pass in a new cloned object.
			const ce = {
				...cloudevent,
				[TTL_KEY]: addSeconds(new Date(), this.expireAfterSeconds),
			}

			// * The insert will fail if this cloudevent is a duplicate because
			// * of the unique index we created above.
			await collection.insertOne(ce)
		} catch(err) {
			if (err.code !== MONGODB_DUPLICATE_ERROR_CODE) throw err
			skip = true
		}
		return { skip }
	}

	async erase({ cloudevent }) {
		// * Create connection to database if it does not already exist.
		if (typeof this.mongoConnectPromise === 'undefined') {
			this.mongoConnectPromise = new Mongo({
				db: this.name,
				options: this.options,
				uri: this.uri,
			}).connect()
		}

		// * Fetch the database table.
		const { db } = await this.mongoConnectPromise
		const collection = db.collection(this.table)

		// * Delete all records with the given cloudevents params in an
		// * overabundance of caution that multiple records may exist.
		const { id, source, type } = cloudevent
		await collection.deleteMany({ id, source, type })
	}
}
