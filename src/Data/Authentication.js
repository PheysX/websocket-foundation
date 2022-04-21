import Criteria from './Criteria.js';
import crypto from 'crypto';
import log from 'npmlog'

class Authentication {

    /**
     * @type {string[]}
     */
    actions = [
        'read',
        'write',
        'create',
        'delete',
    ]

    /**
     * @param {DatabaseAccess} db
     * @param {string} userCollection
     * @param {string} userAclRoleCollection
     * @param {string} aclRoleCollection
     */
    constructor(db, userCollection = 'user', userAclRoleCollection = 'userAclRole', aclRoleCollection = 'aclRole') {
        this._db = db
        this._userCollection = userCollection
        this._userAclRoleCollection = userAclRoleCollection
        this._aclRoleCollection = aclRoleCollection
    }

    /**
     * @param {object} payload
     */
    async verifyUser(payload) {
        if (payload.userToken) {
            return await this._verifyUserByToken(payload.userToken)
        } else if (payload.username && payload.password) {
            return await this.verifyUserByCredentials(payload.username, payload.password)
        }

        return false
    }

    /**
     * @param {string} userToken
     */
    async _verifyUserByToken(userToken) {
        const criteria = new Criteria()
        criteria.limit = 1
        criteria.addFilter({
            key: 'userToken',
            value: userToken,
        })

        try {
            const usersResult = await this._db.search(this._userCollection, criteria)
            if (!usersResult.first) {
                return false
            }

            return usersResult.first
        } catch (err) {
            log.error('verifyUserByToken', err)
            return false
        }
    }

    /**
     * @param {string} username
     * @param {string} password
     */
    async verifyUserByCredentials(username, password) {
        const criteria = new Criteria()
        criteria.limit = 1
        criteria.addFilter({
            key: 'username',
            value: username,
        })

        try {
            const usersResult = await this._db.search(this._userCollection, criteria)
            if (!usersResult.first) {
                return false
            }

            const user = usersResult.first
            if (!await this.verify(password, user.password)) {
                return false
            }

            user.userToken = await this.updateUserToken(user._id)

            return user
        } catch (err) {
            log.error('verifyUserByCredentials', err)
            return false
        }
    }

    /**
     * @param {string} userId
     * @param {boolean} isAdmin
     * @param {string[]}entities
     * @return {Promise<[]>}
     */
    async getPermissions(userId, isAdmin, entities) {
        const permissions = []

        if (isAdmin) {
            entities.forEach(entity => {
                this.actions.forEach(action => {
                    permissions.push(`${entity}:${action}`)
                })
            })

            return permissions
        }

        try {
            const userAclRoleCriteria = new Criteria()
            userAclRoleCriteria.limit = 1
            userAclRoleCriteria.addFilter({
                userId: userId,
            })

            const userAclRoleResult = await this._db.search(this._userAclRoleCollection, userAclRoleCriteria)
            if (!userAclRoleResult.first) {
                return []
            }

            const aclRoleCriteria = new Criteria()
            aclRoleCriteria.limit = 1
            aclRoleCriteria.addFilter({
                _id: userAclRoleResult.first.aclRoleId,
            })

            const aclRoleResult = await this._db.search(this._aclRoleCollection, aclRoleCriteria)
            if (!aclRoleResult.first) {
                return []
            }

            return aclRoleResult.first.permissions
        } catch (err) {
            log.error('getPermissions', err)
            return []
        }
    }

    /**
     * @param {string} userId
     */
    async updateUserToken(userId) {
        const userToken = crypto.randomBytes(32).toString('hex')

        try {
            await this._db.update(this._userCollection, userId, {
                userToken: userToken,
            })

            return userToken
        } catch (err) {
            log.error('updateUserToken', err)
            return false
        }
    }

    /**
     * @param {string} password
     */
    async hash(password) {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(8).toString('hex')

            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(salt + ':' + derivedKey.toString('hex'))
            });
        })
    }

    async verify(password, hash) {
        return new Promise((resolve, reject) => {
            const [salt, key] = hash.split(':')
            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(key === derivedKey.toString('hex'))
            });
        })
    }
}

export default Authentication
