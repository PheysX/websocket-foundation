import Schema from './Schema.js'

export default class UserAclRoleSchema extends Schema {

    schema = {
        type: 'object',
        required: [
            '_id',
            'userId',
            'aclRoleId',
        ],
        properties: {
            _id: {
                type: 'string',
                format: 'uuid',
            },
            userId: {
                type: 'string',
                format: 'uuid',
            },
            aclRoleId: {
                type: 'string',
                format: 'uuid',
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
