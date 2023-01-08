import Schema, { allOf, clone } from './Schema.js'
import ManyToManyAssociation from './../Association/ManyToManyAssociation.js'
import UserAclRoleSchema from './../Schema/UserAclRoleSchema.js'
import UserSchema from './../Schema/UserSchema.js'

export default class AclRoleSchema extends Schema {

    static entity = 'aclRole'

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
                allOf: allOf(['trim'], 1),
            },
            permissions: {
                type: 'array',
            },

        },
        additionalProperties: false,
    }

    associations() {
        return [
            new ManyToManyAssociation('users', '_id', UserAclRoleSchema, 'aclRoleId', 'userId', UserSchema),
        ]
    }

    create() {
        return this.schema
    }

    update() {
        const schema = clone(this.schema)

        schema.required = [
            '_id',
        ]

        return schema
    }

    replace() {
        return this.create()
    }
}
