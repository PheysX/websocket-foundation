import Schema from './Schema.js'

export default class AclRoleSchema extends Schema {

    schema = {
        type: 'object',
        required: [
            '_id',
            'name',
            'permissions',
        ],
        properties: {
            _id: {
                type: 'string',
                format: 'uuid',
            },
            name: {
                type: 'string',
                allOf: this.allOf(['trim'], 1),
            },
            permissions: {
                type: 'array',
            },

        },
        additionalProperties: false,
    };

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
