export default class Criteria {

    /**
     * @param {string[]}
     * @private
     */
    _ids = []

    /**
     * @param {object}
     * @private
     */
    _sort = {}

    /**
     * @param {number}
     * @private
     */
    _limit = 50

    /**
     * @param {number}
     * @private
     */
    _offset = 0

    /**
     * @param {object[]}
     * @private
     */
    _filter = []

    /**
     * @param {string[]}
     * @private
     */
    _associations = {}

    /**
     * @param {string[]} ids
     * @param {object} sort
     * @param {number} limit
     * @param {number} offset
     */
    constructor(ids = [], sort = {}, limit = 50, offset = 0) {
        this._ids = ids ?? []
        this._sort = sort ?? {}
        this._limit = limit ?? 50
        this._offset = offset ?? 0
    }

    get ids() {
        return this._ids
    }

    set ids(value) {
        this._ids = value
    }

    get sort() {
        return this._sort
    }

    set sort(value) {
        this._sort = value
    }

    get limit() {
        return this._limit
    }

    set limit(value) {
        if (value < 0) {
            value = 0
        }

        this._limit = value
    }

    get offset() {
        return this._offset
    }

    set offset(value) {
        if (value < 0) {
            value = 0
        }
        this._offset = value
    }

    get filter() {
        return this._filter
    }

    set filter(value) {
        this._filter = value ?? []
    }

    addFilter(value) {
        this._filter.push(value)
    }

    resetFilter() {
        this._filter = []
    }

    get associations() {
        return this._associations
    }

    set associations(value) {
        this._associations = value ?? {}
    }

    resetAssociations() {
        this._associations = {}
    }
}
