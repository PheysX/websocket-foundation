class SearchResult {

    /**
     * @type {object[]}
     * @private
     */
    _items = []

    /**
     * @type {number}
     * @private
     */
    _total = 0

    /**
     * @param {object[]} items
     */
    constructor(items) {
        this._items = items
        this._total = items.length
    }

    get items() {
        return this._items
    }

    get total() {
        return this._total
    }

    get first() {
        if (this._total === 0) {
            return null
        }

        return this._items[0]
    }

    get last() {
        if (this._total === 0) {
            return null
        }

        return this._items[this._total - 1]
    }
}

export default SearchResult
