import Association from './Association.js'

export default class OneToOneAssociation extends Association {

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
     * @param {boolean} autoload
     * @param {boolean} adminOnly
     */
    constructor(propertyName, storageName, referenceField, referenceSchema, autoload = false, adminOnly = false) {
        super(propertyName, autoload, adminOnly);

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
