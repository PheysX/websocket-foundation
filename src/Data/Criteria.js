class Criteria {

    /**
     * @type {string[]}
     * @private
     */
    _ids = []

    /**
     * @type {object}
     * @private
     */
    _sort = {}

    /**
     * @type {number}
     * @private
     */
    _limit = 50

    /**
     * @type {number}
     * @private
     */
    _offset = 0

    /**
     * @type {object[]}
     * @private
     */
    _filter = []

    /**
     * @param {string[]} ids
     * @param {object} sort
     * @param {number} limit
     * @param {number} offset
     */
    constructor(ids = [], sort = {}, limit = 50, offset = 0) {
        this._ids = ids
        this._sort = sort
        this._limit = limit
        this._offset = offset
    }

    get ids() {
        return this._ids;
    }

    set ids(value) {
        this._ids = value
    }

    get sort() {
        return this._sort;
    }

    set sort(value) {
        this._sort = value;
    }

    get limit() {
        return this._limit;
    }

    set limit(value) {
        if (value < 0) {
            value = 0
        }

        this._limit = value;
    }

    get offset() {
        return this._offset;
    }

    set offset(value) {
        if (value < 0) {
            value = 0
        }
        this._offset = value;
    }

    get filter() {
        return this._filter;
    }

    set filter(value) {
        this._filter = value;
    }

    addFilter(value) {
        this._filter.push(value)
    }

    resetFilter() {
        this._filter = []
    }
}

export default Criteria
