import log from 'npmlog'
import {Server} from 'socket.io'
import Criteria from './Data/Criteria.js'
import Authentication from './Data/Authentication.js'
import {instrument} from '@socket.io/admin-ui'
import {createServer} from 'http'
import merge from 'lodash/merge.js'

const httpServer = createServer()

class SocketAccess extends Authentication {

    /**
     * @type {string[]}
     * @private
     */
    _entities = []

    /**
     * @private
     */
    _operations = {
        read: {
            search: this.searchEntity,
            join: this.joinRoom,
            leave: this.leaveRoom,
        },
        write: {
            replace: this.replaceEntity,
            update: this.updateEntity,
        },
        create: {
            create: this.createEntity,
        },
        delete: {
            delete: this.deleteEntity,
        },
    }

    /**
     * @param {DatabaseAccess} db
     * @param {{}} socketParams
     * @param {number} socketPort
     * @param {string[]} entities
     * @param {{}} operations
     * @param {boolean} debugMode
     * @param {SchemaFactory} schemaFactory
     */
    constructor(db, socketParams, socketPort, entities, schemaFactory, operations, debugMode = false) {
        super(db)

        this._entities = entities
        this._db = db
        this._schemaFactory = schemaFactory
        this._socketParams = socketParams
        this._socketPort = socketPort
        this._debugMode = debugMode

        merge(this._operations, operations)

        Object.keys(operations).forEach(operation => {
            this.actions.push(operation)
        })

        this._db.check(this._entities)
        this._init()
    }

    async _init() {
        this.io = new Server(httpServer, this._socketParams)

        instrument(this.io, {
            auth: false,
        })

        this.io.listen(this._socketPort)
        this.listen(this.io, 'connection', (socket) => {
            this.push(socket, 'connected', socket.id)
            this.listen(socket, 'user:login', this.registerLogin.bind(this, socket))
        })
    }

    async registerLogin(socket, data) {
        const user = await this.verifyUser(data)

        if (!user) {
            this.push(socket, 'user:login:failed')
            return
        }

        const permissions = await this.getPermissions(user._id, user.admin, this._entities)
        this.updateSocketData(socket, user, permissions)

        this._entities.forEach(entity => {
            this.actions.forEach(action => {
                if (permissions.includes(`${entity}:${action}`)) {
                    Object.keys(this._operations[action]).forEach((operation) => {
                        this.listen(socket, `${entity}:${action}:${operation}`, this._operations[action][operation].bind(this, socket, entity, this))
                    })
                }
            })
        })

        this.push(socket, 'user:login:success', socket.data.private)
        this.listen(socket, 'disconnect', this.disconnect.bind(this, socket.id, socket.data.private.user._id.toString()))
        socket.removeAllListeners('user:login')
    }

    /**
     * @param {object} socket
     * @param {string} entity
     * @param {SocketAccess} SocketAccess
     * @param {string} data
     */
    async joinRoom(socket, entity, data) {
        const identifier = data
        if (!await this.entityExists(entity, identifier)) {
            return
        }

        socket.join(`${entity}-${identifier}`)

        const clientsData = []
        const clients = await this.io.in(`${entity}-${identifier}`).fetchSockets()

        clients.forEach((socket) => {
            clientsData.push(socket.data.public.user)
        })

        this.io.in(`${entity}-${identifier}`).emit('client:update', clientsData)
        socket.to(`${entity}-${identifier}`).emit('client:joined', socket.data.public.user)
    }

    /**
     * @param {object} socket
     * @param {string} entity
     * @param {SocketAccess} SocketAccess
     * @param {string} data
     */
    async leaveRoom(socket, entity, SocketAccess, data) {
        const identifier = data
        if (!await this.entityExists(entity, identifier)) {
            return
        }

        socket.leave(`${entity}-${identifier}`)
        socket.to(`${entity}-${identifier}`).emit('client:leaved', socket.data.public.user)
    }

    /**
     * @param {object} socket
     * @param {string} entity
     * @param {SocketAccess} SocketAccess
     * @param {object} data
     * @returns {Promise<void>}
     */
    async searchEntity(socket, entity, SocketAccess, data) {
        try {
            const criteria = new Criteria(data.ids, data.sort, data.limit, data.offset)
            criteria.filter = data.filter

            const result = await this._db.search(entity, criteria)
            this.push(socket, `${entity}:found`, result.items)
        } catch (err) {
            this.push(socket, `${entity}:search:error`, err)
        }
    }

    /**
     * @param {object} socket
     * @param {string} entity
     * @param {SocketAccess} SocketAccess
     * @param {object} data
     * @returns {Promise<void>}
     */
    async createEntity(socket, entity, SocketAccess, data) {
        try {
            await this.validate(entity, 'create', data, this.isAdmin(socket))

            const id = await this._db.create(entity, data)
            this.push(socket, `${entity}:created`, id)
        } catch (err) {
            this.push(socket, `${entity}:create:error`, err)
        }
    }

    /**
     * @param {object} socket
     * @param {string} entity
     * @param {SocketAccess} SocketAccess
     * @param {object} data
     * @returns {Promise<void>}
     */
    async replaceEntity(socket, entity, SocketAccess, data) {
        try {
            await this.validate(entity, 'replace', data, this.isAdmin(socket))
            await this._db.replace(entity, data._id, data)

            this.push(socket, `${entity}:replaced`)
            socket.to(`${entity}-${data._id}`).emit('updated')
        } catch (err) {
            this.push(socket, `${entity}:replace:error`, err)
        }
    }

    /**
     * @param {object} socket
     * @param {string} entity
     * @param {SocketAccess} SocketAccess
     * @param {object} data
     * @returns {Promise<void>}
     */
    async updateEntity(socket, entity, SocketAccess, data) {
        try {
            await this.validate(entity, 'update', data, this.isAdmin(socket))
            await this._db.update(entity, data._id, data)

            this.push(socket, `${entity}:updated`)
            socket.to(`${entity}-${data._id}`).emit('updated')
        } catch (err) {
            this.push(socket, `${entity}:update:error`, err)
        }
    }

    /**
     * @param {object} socket
     * @param {string} entity
     * @param {SocketAccess} SocketAccess
     * @param {object} data
     * @returns {Promise<void>}
     */
    async deleteEntity(socket, entity, SocketAccess, data) {
        const ids = data.ids

        try {
            const criteria = new Criteria(ids)
            const deletedCount = await this._db.delete(entity, criteria.ids)

            this.push(socket, `${entity}:deleted`, deletedCount)
            ids.forEach(id => {
                socket.to(`${entity}-${id}`).emit('deleted')
            })
        } catch (err) {
            this.push(socket, `${entity}:delete:error`, err)
        }
    }

    /**
     * @param {string} entity
     * @param {string} identifier
     * @return {Promise<boolean>}
     */
    async entityExists(entity, identifier) {
        try {
            const criteria = new Criteria([identifier], {}, 1)
            const searchResult = await this._db.search(entity, criteria)

            return !!searchResult.first
        } catch (err) {
            if (this._debugMode) {
                log.error('search:error', err)
            }

            return false
        }
    }

    /**
     * @param {string} entity
     * @param {string} action
     * @param {boolean} isAdmin
     * @param {{}} data
     */
    async validate(entity, action, data, isAdmin) {
        const validator = this._schemaFactory.get(entity, action)

        this._schemaFactory.reduce(entity, action, data, isAdmin)
        validator(data)

        if (validator.errors) {
            throw validator.errors
        }

        return true
    }

    /**
     * @param {Socket} socket
     * @param {{}} user
     * @param {string[]} permissions
     */
    updateSocketData(socket, user, permissions) {
        socket.data = {
            private: {
                user: user,
                permissions: permissions,
            },
            public: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                }
            },
        }
    }

    /**
     * @param {{}} target
     * @param {string} event
     * @param callback
     */
    listen(target, event, callback) {
        target.on(event, callback)
    }

    /**
     * @param {{}} target
     * @param {string} event
     * @param data
     */
    push(target, event, data = null) {
        target.emit(event, data)

        if (!this._debugMode) {
            return
        }

        log.info(event, data)
    }

    /**
     * @param {string} socketId
     * @param {string} userId
     */
    disconnect(socketId, userId) {
        if (!this._debugMode) {
            return
        }

        log.info('disconnect', socketId, userId)
    }
}

export default SocketAccess
