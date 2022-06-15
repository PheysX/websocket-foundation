import Criteria from './../../Data/Criteria.js'
import OneToOneAssociation from './OneToOneAssociation.js'
import OneToManyAssociation from './OneToManyAssociation.js'
import ManyToOneAssociation from './ManyToOneAssociation.js'
import ManyToManyAssociation from './ManyToManyAssociation.js'

export default class AssociationResolver {

    /**
     * @param {{}}
     * @private
     */
    _cache = {}

    /**
     *
     * @param {DatabaseAccess} db
     * @param {SchemaFactory} schemaFactory
     */
    constructor(db, schemaFactory) {
        this._db = db
        this._schemaFactory = schemaFactory
    }

    /**
     * @param {object} socket
     * @param {string} entity
     * @param {SearchResult} result
     * @param {Criteria} criteria
     * @param {boolean} isAdmin
     */
    async resolve(socket, entity, result, criteria, isAdmin) {
        this._cache = {}
        await this.enrich(entity, result.items, criteria.associations, socket.data.private.permissions, isAdmin)
    }

    /**
     * @param {string} entity
     * @param {array} elements
     * @param {{}} userAssociations
     * @param {[]} permissions
     * @param {boolean} isAdmin
     */
    async enrich(entity, elements, userAssociations, permissions, isAdmin) {
        const associations = this._schemaFactory.getAssociations(entity)

        await Promise.all(elements.map(async (element) => {
            const associationsResult = {}

            await Promise.all(associations.map(async (association) => {
                const associationEntity = association.referenceSchema.entity
                let associationSettings = userAssociations[association.propertyName]

                if (permissions.includes(`${associationEntity}:read`)) {
                    if (association.autoload || !!associationSettings) {
                        associationSettings = this._mergeCriteria(associationSettings)

                        if (isAdmin || !association.adminOnly) {
                            switch (association.constructor.name) {
                                case OneToOneAssociation.name:
                                    await this.oneToOne(element, associationsResult, associationSettings, association)
                                    await this.enrich(associationEntity, [associationsResult[association.propertyName]], associationSettings.associations, permissions, isAdmin)

                                    break
                                case OneToManyAssociation.name:
                                    await this.oneToMany(element, associationsResult, associationSettings, association)
                                    await this.enrich(associationEntity, associationsResult[association.propertyName], associationSettings.associations, permissions, isAdmin)

                                    break
                                case ManyToOneAssociation.name:
                                    await this.manyToOne(element, associationsResult, associationSettings, association)
                                    await this.enrich(associationEntity, [associationsResult[association.propertyName]], associationSettings.associations, permissions, isAdmin)

                                    break
                                case ManyToManyAssociation.name:
                                    await this.manyToMany(element, associationsResult, associationSettings, association)
                                    await this.enrich(associationEntity, associationsResult[association.propertyName], associationSettings.associations, permissions, isAdmin)

                                    break
                            }
                        }
                    }
                }
            }))

            element.associations = associationsResult
        }))
    }

    /**
     * @param {{}} element
     * @param {{}} associationsResult
     * @param {{}} associationSettings
     * @param {Association} association
     */
    async oneToOne(element, associationsResult, associationSettings, association) {
        if (this._cache[`${association.referenceSchema.entity}-${element[association.storageName]}`]) {
            associationsResult[association.propertyName] = this._cache[`${association.referenceSchema.entity}-${element[association.storageName]}`]

            return
        }

        const criteria = new Criteria(associationSettings.ids, associationSettings.sort, associationSettings.limit, associationSettings.offset)

        criteria.filter = associationSettings.filter
        criteria.addFilter({
            key: association.referenceField,
            value: element[association.storageName],
        })

        const result = (await this._db.search(association.referenceSchema.entity, criteria)).first

        associationsResult[association.propertyName] = result
        this._cache[`${association.referenceSchema.entity}-${element[association.storageName]}`] = result
    }

    /**
     * @param {{}} element
     * @param {{}} associationsResult
     * @param {{}} associationSettings
     * @param {Association} association
     */
    async oneToMany(element, associationsResult, associationSettings, association) {
        const criteria = new Criteria(associationSettings.ids, associationSettings.sort, associationSettings.limit, associationSettings.offset)

        criteria.filter = associationSettings.filter
        criteria.addFilter({
            key: association.referenceField,
            value: element[association.storageName],
        })

        associationsResult[association.propertyName] = (await this._db.search(association.referenceSchema.entity, criteria)).items
    }

    /**
     * @param {{}} element
     * @param {{}} associationsResult
     * @param {{}} associationSettings
     * @param {Association} association
     */
    async manyToOne(element, associationsResult, associationSettings, association) {
        if (this._cache[`${association.referenceSchema.entity}-${element[association.storageName]}`]) {
            associationsResult[association.propertyName] = this._cache[`${association.referenceSchema.entity}-${element[association.storageName]}`]

            return
        }

        const criteria = new Criteria(associationSettings.ids, associationSettings.sort, associationSettings.limit, associationSettings.offset)

        criteria.filter = associationSettings.filter
        criteria.addFilter({
            key: association.referenceField,
            value: element[association.storageName],
        })

        const result = (await this._db.search(association.referenceSchema.entity, criteria)).first

        associationsResult[association.propertyName] = result
        this._cache[`${association.referenceSchema.entity}-${element[association.storageName]}`] = result
    }

    /**
     * @param {{}} element
     * @param {{}} associationsResult
     * @param {{}} associationSettings
     * @param {Association} association
     */
    async manyToMany(element, associationsResult, associationSettings, association) {
        const mappingCriteria = new Criteria()

        mappingCriteria.limit = -1
        mappingCriteria.addFilter({
            key: association.mappingLocalField,
            value: element[association.storageName],
        })

        const mappingResult = (await this._db.search(association.mappingSchema.entity, mappingCriteria))
        if (mappingResult.total <= 0) {
            associationsResult[association.propertyName] = []

            return
        }

        const referenceIds = []
        mappingResult.items.forEach(mappingItem => {
            referenceIds.push(mappingItem[association.mappingReferenceField])
        })

        const criteria = new Criteria(associationSettings.ids, associationSettings.sort, associationSettings.limit, associationSettings.offset)
        criteria.filter = associationSettings.filter
        criteria.addFilter({
            key: association.referenceField,
            value: {
                $in: referenceIds,
            },
        })

        associationsResult[association.propertyName] = (await this._db.search(association.referenceSchema.entity, criteria)).items
    }

    /**
     * @param {{}|null} associationSettings
     * @return {{associations}}
     * @private
     */
    _mergeCriteria(associationSettings) {
        associationSettings = associationSettings ?? {}
        if (!associationSettings.ids) {
            associationSettings.ids = []
        }
        if (!associationSettings.limit) {
            associationSettings.limit = Criteria._limit
        }
        if (!associationSettings.offset) {
            associationSettings.offset = Criteria._offset
        }
        if (!associationSettings.sort) {
            associationSettings.sort = {}
        }
        if (!associationSettings.filter) {
            associationSettings.filter = []
        }
        if (!associationSettings.associations) {
            associationSettings.associations = {}
        }

        return associationSettings
    }
}
