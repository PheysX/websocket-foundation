import Schema, { allOf, clone } from './Schema.js'
import ManyToManyAssociation from './../Association/ManyToManyAssociation.js'
import UserAclRoleSchema from './../Schema/UserAclRoleSchema.js'
import AclRoleSchema from './../Schema/AclRoleSchema.js'
import ManyToOneAssociation from './../Association/ManyToOneAssociation.js'
import SalutationSchema from './../Schema/SalutationSchema.js'

export default class UserSchema extends Schema {

    static entity = 'user'

    schema = {
        type: 'object',
        required: [
            '_id',
            'username',
            'password',
            'salutationId',
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
                allOf: allOf(['trim'], 1),
                validate: [
                    'alreadyExists',
                ],
            },
            password: {
                type: 'string',
                format: 'password',
                allOf: allOf([], 145, 145),
            },
            salutationId: {
                type: 'string',
                format: 'uuid',
            },
            firstName: {
                type: 'string',
                allOf: allOf(['trim'], 1),
            },
            lastName: {
                type: 'string',
                allOf: allOf(['trim'], 1),
            },
            email: {
                type: 'string',
                format: 'email',
                validate: [
                    'alreadyExists',
                ],
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
                allOf: allOf(['trim'], 64, 64),
            },
        },
        additionalProperties: false,
    }

    associations() {
        return [
            new ManyToOneAssociation('salutation', 'salutationId', SalutationSchema, '_id', true),
            new ManyToManyAssociation('aclRoles', '_id', UserAclRoleSchema, 'userId', 'aclRoleId', AclRoleSchema),
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
