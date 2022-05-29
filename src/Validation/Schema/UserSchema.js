import Schema from './Schema.js'

export default class UserSchema extends Schema {

    schema = {
        type: 'object',
        required: [
            '_id',
            'username',
            'password',
            'firstName',
            'lastName',
            'email',
            'active',
            'admin',
        ],
        properties: {
            _id: {
                type: 'string',
                format: 'uuid',
            },
            username: {
                type: 'string',
                allOf: this.allOf(['trim'], 1),
            },
            password: {
                type: 'string',
                format: 'password',
                allOf: this.allOf([], 145, 145),
            },
            firstName: {
                type: 'string',
                allOf: this.allOf(['trim'], 1),
            },
            lastName: {
                type: 'string',
                allOf: this.allOf(['trim'], 1),
            },
            email: {
                type: 'string',
                format: 'email',
            },
            active: {
                type: 'boolean',
                default: false,
            },
            admin: {
                type: 'boolean',
                default: false,
                adminOnly: true,
            },
            userToken: {
                type: ['string', 'null'],
                default: null,
                readOnly: true,
                anyOf: [
                    {
                        type: 'string',
                    }, {
                        type: 'null'
                    }
                ],
                allOf: this.allOf(['trim'], 64, 64),
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
