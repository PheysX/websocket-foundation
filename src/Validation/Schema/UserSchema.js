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
            },
            userToken: {
                type: 'string',
                default: null,
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
