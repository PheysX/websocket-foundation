import Association from './Association.js'

export default class OneToManyAssociation extends Association {

    /**
     * @param {string}
     * @private
     */
    _storageName

    /**
     * @param {string} propertyName
     * @param {string} storageName
     * @param {string} referenceField
     * @param {Schema} referenceSchema
     * @param {boolean} adminOnly
     */
    constructor(propertyName, storageName, referenceField, referenceSchema, adminOnly = false) {
        super(propertyName, false, adminOnly);

        this._storageName = storageName
        this._referenceField = referenceField
        this._referenceSchema = referenceSchema
    }

    /**
     * @return {string}
     */
    get storageName() {
        return this._storageName;
    }
}
