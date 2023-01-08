import Schema, { allOf, clone } from './Schema.js'

export default class CountrySchema extends Schema {

    static entity = 'country'

    schema = {
        type: 'object',
        required: [
            '_id',
            'iso2',
            'iso3',
            'name',
        ],
        properties: {
            _id: {
                type: 'string',
                format: 'uuid',
            },
            iso2: {
                type: 'string',
                allOf: allOf(['trim', 'toUpperCase'], 2, 2),
                validate: [
                    'alreadyExists',
                ],
            },
            iso3: {
                type: 'string',
                allOf: allOf(['trim', 'toUpperCase'], 3, 3),
                validate: [
                    'alreadyExists',
                ],
            },
            name: {
                type: 'string',
                allOf: allOf(['trim'], 1),
            },
        },
        additionalProperties: false,
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
