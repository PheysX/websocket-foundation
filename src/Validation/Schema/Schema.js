export default class Schema {

    /**
     * @param {string[]} transform
     * @param {number|null} minLength
     * @param {number|null} maxLength
     * @return {*[]}
     */
    allOf(transform = [], minLength = null, maxLength = null) {
        const allOf = [{
            transform: transform,
        }]

        if (minLength) {
            allOf.push({
                minLength: minLength
            })
        }

        if (maxLength) {
            allOf.push({
                maxLength: maxLength
            })
        }

        return allOf
    }

    /**
     * @param {{}} object
     * @return {{}}
     */
    clone(object) {
        return JSON.parse(JSON.stringify(object))
    }
}
