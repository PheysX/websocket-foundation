import Schema, { allOf, clone } from './Schema.js'
import OneToManyAssociation from './../Association/OneToManyAssociation.js'
import UserSchema from './../Schema/UserSchema.js'

export default class SalutationSchema extends Schema {

    static entity = 'salutation'

    schema = {
        type: 'object',
        required: [
            '_id',
            'salutationKey',
            'displayName',
            'letterName',
        ],
        properties: {
            _id: {
                type: 'string',
                format: 'uuid',
            },
            salutationKey: {
                type: 'string',
                allOf: allOf(['trim'], 1),
                validate: [
                    'alreadyExists',
                ],
            },
            displayName: {
                type: 'string',
                allOf: allOf(['trim'], 1),
            },
            letterName: {
                type: 'string',
                allOf: allOf(['trim'], 1),
            },
        },
        additionalProperties: false,
    }

    associations() {
        return [
            new OneToManyAssociation('users', '_id', 'salutationId', UserSchema),
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
