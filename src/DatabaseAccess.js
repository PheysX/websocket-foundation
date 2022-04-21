import { MongoClient, ServerApiVersion } from 'mongodb';
import SearchResult from './Data/SearchResult.js';

class DatabaseAccess {
    /**
     * @param {string} clusterName
     * @param {string} databaseName
     * @param {string} username
     * @param {string} password
     */
    constructor(clusterName, databaseName, username, password) {
        const uri = `mongodb+srv://${username}:${password}@${clusterName}.d45oy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

        this._client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: ServerApiVersion.v1,
        });

        this._client.connect()
        this._db = this._client.db(`${databaseName}`);
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
