import Association from './Association.js'

export default class ManyToManyAssociation extends Association {

    /**
     * @param {string}
     * @private
     */
    _mappingSchema

    /**
     * @param {string}
     * @private
     */
    _mappingLocalField

    /**
     * @param {string}
     * @private
     */
    _mappingReferenceField

    /**
     * @param {string}
     * @private
     */
    _storageName

    /**
     * @param {string} propertyName
     * @param {string} storageName
     * @param {Schema} mappingSchema
     * @param {string} mappingLocalField
     * @param {string} mappingReferenceField
     * @param {Schema} referenceSchema
     * @param {string} referenceField
     * @param {boolean} adminOnly
     */
    constructor(propertyName, storageName, mappingSchema, mappingLocalField, mappingReferenceField, referenceSchema, referenceField = '_id', adminOnly = false) {
        super(propertyName, false, adminOnly);

        this._mappingLocalField = mappingLocalField
        this._mappingReferenceField = mappingReferenceField
        this._mappingSchema = mappingSchema
        this._storageName = storageName
        this._referenceField = referenceField
        this._referenceSchema = referenceSchema
        this._storageName = storageName;
    }

    get storageName() {
        return this._storageName;
    }

    get mappingSchema() {
        return this._mappingSchema;
    }

    get mappingLocalField() {
        return this._mappingLocalField;
    }

    get mappingReferenceField() {
        return this._mappingReferenceField;
    }
}
