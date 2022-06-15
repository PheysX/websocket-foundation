export default class Association {

    /**
     * @param {string}
     * @private
     */
    _propertyName

    /**
     * @param {string}
     * @private
     */
    _referenceSchema

    /**
     * @param {string}
     * @private
     */
    _referenceField

    /**
     * @param {bool}
     * @private
     */
    _autoload = false

    /**
     * @param {boolean}
     * @private
     */
    _adminOnly = false

    /**
     * @param {string} propertyName
     * @param {boolean} autoload
     * @param {boolean} adminOnly
     */
    constructor(propertyName, autoload = false, adminOnly = false) {
        this._autoload = autoload
        this._adminOnly = adminOnly
        this._propertyName = propertyName
    }

    get propertyName() {
        return this._propertyName;
    }

    get referenceSchema() {
        return this._referenceSchema;
    }

    get referenceField() {
        return this._referenceField;
    }

    get autoload() {
        return this._autoload;
    }

    get adminOnly() {
        return this._adminOnly;
    }
}
