import Ajv from 'ajv'
import definitions from 'ajv-keywords/dist/definitions/index.js'
import addFormats from 'ajv-formats'
import { hash } from './../Util/crypto.util.js'

export default class SchemaFactory {

    /**
     * @param {{}}
     * @private
     */
    _ajv = {}

    /**
     *
     * @param {{}} entities
     */
    constructor(entities, args = {}) {
        const ajv = new Ajv({
            allErrors: true,
            useDefaults: true,
            keywords: definitions(),
            ...args
        })

        this._addFormats(ajv)
        this._addKeywords(ajv)

        Object.keys(entities).forEach((entity) => {
            const schema = new entities[entity]

            this._ajv[entity] = {
                search: {
                    associations: schema.associations(),
                },
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
     */
    prepare(entity, action, data, isAdmin) {
        if (!this._ajv[entity]) {
            return
        }

        this.reduce(entity, action, data, isAdmin)
        this.transform(entity, action, data, isAdmin)
    }

    /**
     * @param {string} entity
     * @param {string} action
     * @param {{}} data
     * @param {boolean} isAdmin
     */
    reduce(entity, action, data, isAdmin) {
        const schema = this._ajv[entity][action].schema
        Object.values(schema.properties).forEach((value, index) => {
            if (!!value.readOnly) {
                delete data[Object.keys(schema.properties)[index]]
            }
            if (!isAdmin && !!value.adminOnly) {
                delete data[Object.keys(schema.properties)[index]]
            }
        })
    }

    /**
     * @param {string} entity
     * @param {string} action
     * @param {{}} data
     * @param {boolean} isAdmin
     */
    transform(entity, action, data, isAdmin) {
        const schema = this._ajv[entity][action].schema
        Object.values(schema.properties).forEach((value, index) => {
            let propertyIdentifier = Object.keys(schema.properties)[index]

            if (value.format === 'password' && typeof data[propertyIdentifier] === 'string') {
                data[propertyIdentifier] = hash(data[propertyIdentifier])
            }
        })
    }

    /**
     * @param {string} entity
     * @param {string} action
     * @return {ValidateFunction|null}
     */
    getValidator(entity, action) {
        if (!this._ajv[entity]) {
            return null
        }

        return this._ajv[entity][action].compile
    }

    /**
     * @param {string} entity
     * @param {string} action
     * @return {ValidateFunction|null}
     */
    getAssociations(entity) {
        if (!this._ajv[entity]) {
            return null
        }

        return this._ajv[entity].search.associations
    }

    _addFormats(ajv) {
        addFormats(ajv)
    }

    _addKeywords(ajv) {
        ajv.addVocabulary([
            'adminOnly',
            'validate',
        ])
    }
}
