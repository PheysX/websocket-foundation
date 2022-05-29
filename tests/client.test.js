require('dotenv/config')
const client = require('socket.io-client')
const {v4: uuidv4} = require('uuid')

const uri = process.env.WEBSOCKET_TEST_URI
const adminUser = process.env.WEBSOCKET_TEST_ADMIN_USER
const adminPass = process.env.WEBSOCKET_TEST_ADMIN_PASS

describe('client', () => {
    let clientSocket
    let user, permissions

    const userId = uuidv4()

    beforeAll(done => {
        clientSocket = client(uri)
        clientSocket.once('connect', done)
    })

    afterAll(() => {
        clientSocket.close()
    })

    it('should not login with credentials', done => {
        clientSocket.once('user:login:failed', () => {
            done()
        })

        clientSocket.emit('user:login', {
            username: 'admin',
            password: 'wrongPassword',
        })
    })

    it('should login with credentials', done => {
        clientSocket.once('user:login:success', data => {
            expect(data.user.username).toBe(adminUser)
            expect(data.permissions.length).toBeGreaterThan(0)

            permissions = data.permissions
            user = data.user
            done()
        })

        clientSocket.emit('user:login', {
            username: adminUser,
            password: adminPass,
        })
    })

    it('should not login with userToken', done => {
        clientSocket.disconnect()
        clientSocket.connect()

        clientSocket.once('user:login:failed', () => {
            done()
        })

        clientSocket.emit('user:login', {
            userToken: 'wrongToken',
        })
    })

    it('should login with userToken', done => {
        clientSocket.once('user:login:success', data => {
            expect(data.user.username).toBe(adminUser)
            expect(data.permissions.length).toBeGreaterThan(0)

            permissions = data.permissions
            user = data.user
            done()
        })

        clientSocket.emit('user:login', {
            userToken: user.userToken,
        })
    })

    it('should not create user', done => {
        clientSocket.once('user:create:error', errors => {
            expect(errors.length).toBeGreaterThan(0)
            done()
        })

        clientSocket.emit('user:create:create', {})
    })

    it('should create user', done => {
        clientSocket.once('user:created', id => {
            expect(id).toBe(userId)
            done()
        })

        clientSocket.emit('user:create:create', {
            _id: userId,
            username: 'JohnDoe',
            password: '1234567890123456789012345678901234567890123456789012345678901234',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            admin: true,
        })
    })

    it('should not find created user', done => {
        clientSocket.once('user:found', result => {
            expect(result.length).toEqual(0)
            done()
        })

        clientSocket.emit('user:read:search', {
            ids: [
                'notJoe',
            ],
            limit: 50,
            offset: 0,
            sort: {},
            filter: []
        })
    })

    it('should find created user', done => {
        clientSocket.once('user:found', result => {
            expect(result.length).toEqual(1)
            expect(result[0].username).toEqual('JohnDoe')
            done()
        })

        clientSocket.emit('user:read:search', {
            ids: [
                userId,
            ],
            limit: 50,
            offset: 0,
            sort: {},
            filter: []
        })
    })

    it('should not update user', done => {
        clientSocket.once('user:update:error', errors => {
            expect(errors.length).toBeGreaterThan(0)
            done()
        })

        clientSocket.emit('user:write:update', {
            firstName: 'Joe',
        })
    })

    it('should update user', done => {
        clientSocket.once('user:updated', result => {
            expect(result).toBeNull()
            done()
        })

        clientSocket.emit('user:write:update', {
            _id: userId,
            username: 'JoeDoe',
            firstName: 'Joe',
            email: 'joe.doe@example.com',
        })
    })

    it('should delete user', done => {
        clientSocket.once('user:deleted', deletedCount => {
            expect(deletedCount).toEqual(1)
            done()
        })

        clientSocket.emit('user:delete:delete', {
            ids: [
                userId,
            ],
        })
    })
})
