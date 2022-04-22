import Ajv from 'ajv'
import definitions from 'ajv-keywords/dist/definitions/index.js'
import addFormats from 'ajv-formats'

class SchemaFactory {

    /**
     * @type {{}}
     * @private
     */
    _ajv = {}

    /**
     *
     * @param {{}} entities
     */
    constructor(entities) {
        const ajv = new Ajv({
            allErrors: true,
            useDefaults: true,
            keywords: definitions(),
        })

        this._addFormats(ajv)
        this._addKeywords(ajv)

        Object.keys(entities).forEach((entity) => {
            const schema = new entities[entity]

            this._ajv[entity] = {
                create: ajv.compile(schema.create()),
                update: ajv.compile(schema.update()),
                replace: ajv.compile(schema.replace()),
            }
        })
    }

    get(entity, action) {
        if (!this._ajv[entity]) {
            return null
        }

        return this._ajv[entity][action]
    }

    _addFormats(ajv) {
        addFormats(ajv)
    }

    _addKeywords(ajv) {

    }
}

export default SchemaFactory
