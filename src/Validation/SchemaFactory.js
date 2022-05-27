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
                create: {
                    schema: schema.create(),
                    compile: ajv.compile(schema.create()),
                },
                update: {
                    schema: schema.update(),
                    compile: ajv.compile(schema.update()),
                },
                replace: {
                    schema: schema.replace(),
                    compile: ajv.compile(schema.replace()),
                },
            }
        })
    }

    /**
     * @param {string} entity
     * @param {string} action
     * @param {{}} data
     * @param {boolean} isAdmin
     * @return {{}}
     */
    reduce(entity, action, data, isAdmin) {
        if (!this._ajv[entity]) {
            return data
        }

        const schema = this._ajv[entity][action].schema
        Object.values(schema.properties).forEach((value, index) => {
            if (!!value.readOnly) {
                delete data[Object.keys(schema.properties)[index]]
            }
            if (!isAdmin && !!value.adminOnly) {
                delete data[Object.keys(schema.properties)[index]]
            }
        })

        return data
    }

    /**
     * @param {string} entity
     * @param {string} action
     */
    get(entity, action) {
        if (!this._ajv[entity]) {
            return null
        }

        return this._ajv[entity][action].compile
    }

    _addFormats(ajv) {
        addFormats(ajv)
    }

    _addKeywords(ajv) {
        ajv.addVocabulary([
            'adminOnly',
        ])
    }
}

export default SchemaFactory
