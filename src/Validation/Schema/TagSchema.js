import Schema, { allOf } from './Schema.js'

export default class TagSchema extends Schema {

    static entity = 'tag'

    schema = {
        type: 'object',
        required: [
            '_id',
            'name',
        ],
        properties: {
            _id: {
                type: 'string',
                format: 'uuid',
            },
            name: {
                type: 'string',
                allOf: allOf(['trim'], 1),
                validate: [
                    'alreadyExists',
                ],
            },
        },
        additionalProperties: false,
    }

    create() {
        return this.schema
    }

    update() {
        return this.create()
    }

    replace() {
        return this.create()
    }
}
