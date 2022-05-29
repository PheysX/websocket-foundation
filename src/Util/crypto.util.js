import crypto from 'crypto';

/**
 * @param {string} password
 * @return {string}
 */
export function hash(password) {
    const salt = randomHex(8)

    return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`
}

/**
 * @param {string} password
 * @param {string} hash
 * @return {Promise<unknown>}
 */
export async function verify(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(':')
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err)
            resolve(key === derivedKey.toString('hex'))
        })
    })
}

/**
 * @param {number} size
 * @param {BufferEncoding} encoding
 * @return {string}
 */
export function randomHex(size = 32, encoding = 'hex') {
    return crypto.randomBytes(size).toString(encoding)
}
