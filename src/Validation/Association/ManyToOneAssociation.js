import Association from './Association.js'

export default class ManyToOneAssociation extends Association {

    /**
     * @param {string}
     * @private
     */
    _storageName

    /**
     * @param {string} propertyName
     * @param {string} storageName
     * @param {Schema} referenceSchema
     * @param {string} referenceField
     * @param {boolean} autoload
     * @param {boolean} adminOnly
     */
    constructor(propertyName, storageName, referenceSchema, referenceField = '_id', autoload = false, adminOnly = false) {
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
