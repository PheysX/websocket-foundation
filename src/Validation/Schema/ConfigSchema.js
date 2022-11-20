import Schema from './Schema.js'

export default class ConfigSchema extends Schema {

    static entity = 'config'

    schema = {
        type: 'object',
        required: [
            '_id',
            'configKey',
            'configValue',
        ],
        properties: {
            _id: {
                type: 'string',
                format: 'uuid',
            },
            configKey: {
                type: 'string',
                allOf: this.allOf(['trim'], 1),
                validate: [
                    'alreadyExists',
                ],
            },
            configValue: {
                type: 'string',
                allOf: this.allOf(['trim'], 1),
            },
        },
        additionalProperties: false,
    }

    create() {
        return this.schema
    }

    update() {
        const schema = this.clone(this.schema)

        schema.required = [
            '_id',
        ]

        return schema
    }

    replace() {
        return this.create()
    }
}
