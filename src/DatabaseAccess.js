import { MongoClient, ServerApiVersion } from 'mongodb'
import SearchResult from './Data/SearchResult.js'

class DatabaseAccess {

    /**
     * @param {string}
     * @private
     */
    _databaseName = null

    /**
     * @param {string} uri
     * @param {string} databaseName
     */
    constructor(uri, databaseName) {
        this._databaseName = databaseName
        this._client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: ServerApiVersion.v1,
        });

        this._connect()
    }

    async _connect() {
        await this._client.connect()
        this._db = this._client.db(this._databaseName);
    }

    /**
     * @param {string[]} entities
     * @returns {Promise<void>}
     */
    async check(entities = []) {
        await this._connect()

        const collections = await this._db.listCollections().toArray()

        const collectionNames = []
        collections.forEach(collection => {
            collectionNames.push(collection.name)
        })

        entities.forEach(entity => {
            if (!collectionNames.includes(entity)) {
                this._db.createCollection(entity)
            }
        })
    }

    /**
     * @param {string} collectionName
     * @param {Criteria} criteria
     * @return {Promise<SearchResult>}
     */
    async search(collectionName, criteria) {
        const parameters = {}

        if (criteria.filter.length > 0) {
            criteria.filter.forEach(filter => {
                if (filter.key && filter.value) {
                    parameters[filter.key] = filter.value
                }
            })
        }

        if (criteria.ids.length > 0) {
            parameters._id = {
                $in: criteria.ids,
            }
        }

        const result = this._db.collection(collectionName).find(parameters)
            .skip(criteria.offset)
            .limit(criteria.limit)
            .sort(criteria.sort)

        return new SearchResult(await result.toArray())
    }

    /**
     * @param {string} collectionName
     * @param {Object} data
     * @returns {Promise<string>}
     */
    async create(collectionName, data) {
        data.createdAt = new Date()
        data.updatedAt = null

        let result = await this._db.collection(collectionName).insertOne(data);

        return result.insertedId.toString();
    }

    /**
     * @param {string} collectionName
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<void>}
     */
    async update(collectionName, id, data) {
        data.updatedAt = new Date()

        await this._db.collection(collectionName).updateOne({
            _id: id,
        }, {
            $set: data,
        });
    }

    /**
     * @param {string} collectionName
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<void>}
     */
    async replace(collectionName, id, data) {
        data.createdAt = new Date()
        data.updatedAt = null

        await this._db.collection(collectionName).replaceOne({
            _id: id,
        }, {
            $set: data,
        });
    }

    /**
     *
     * @param {string} collectionName
     * @param {string[]} ids
     */
    async delete(collectionName, ids = []) {
        let result = await this._db.collection(collectionName).deleteMany({
            _id: {
                $in: ids
            }
        });

        return result.deletedCount
    }
}

export default DatabaseAccess
