# websocket-foundation

[Socket.io](https://socket.io) & [mongoDB](https://www.mongodb.com/) based websocket server foundation.

## Permissions

### Default permissions

| Operation | Actions                  |
|-----------|--------------------------|
| Read      | `search`,`join`, `leave` |
| Write     | `replace`, `update`      |
| create    | `create`                 |
| delete    | `delete`                 |

## Entities

Every entity needs a schema to pass the validation step. The Schema is based
on [Ajv JSON schema validator](https://github.com/ajv-validator/ajv).

The SocketAccess checks whether the entities exist and create collections if they don't.
**MongoDB collections are never deleted when you remove existing entities.**

### Default entities

| Entity      | Schema                                                                                                                   |
|-------------|--------------------------------------------------------------------------------------------------------------------------|
| user        | [UserSchema](https://github.com/PheysX/websocket-foundation/blob/main/src/Validation/Schema/UserSchema.js)               |
| aclRole     | [AclRoleSchema](https://github.com/PheysX/websocket-foundation/blob/main/src/Validation/Schema/AclRoleSchema.js)         |
| userAclRole | [UserAclRoleSchema](https://github.com/PheysX/websocket-foundation/blob/main/src/Validation/Schema/UserAclRoleSchema.js) |

## Socket Access

All generated events expect an authentication. Authenticate yourself via `user:login` with credentials or userToken:

```
{
    "username": "",
    "password": ""
}
```

```
{
    "userToken": ""
}
```

| Trigger Event | Result Event         | Error Event         |
|---------------|----------------------|---------------------|
| `user:login`  | `user:login:success` | `user:login:failed` |

---

# Events

The SocketAccess will automatically generate events for your entities in combination with all of your operations and
actions.

## Example

You are creating a new entity `document`. The system will create events to communicate with the socket.

| Trigger Event            | Result Event        | Error Event              | Additional entity room events    |
|--------------------------|---------------------|--------------------------|----------------------------------|
| `document:read:search`   | `document:found`    | `document:search:error`  | -                                |
| `document:read:join`     | `client:update`     | -                        | `client:joined`, `client:update` |
| `document:read:leave`    | -                   | -                        | `client:leaved`                  |
| `document:write:replace` | `document:replaced` | `document:replace:error` | `updated`                        |
| `document:write:update`  | `document:updated`  | `document:update:error`  | `updated`                        |
| `document:create:create` | `document:created`  | `document:create:error`  | -                                |
| `document:delete:delete` | `document:deleted`  | `document:delete:error`  | `deleted`                        |

## Actions

### `search`

Search for specific ids or with
multiple [mongoDB](https://www.mongodb.com/docs/manual/reference/method/db.collection.find/) `AND` filters.

```
{
    "ids": [],
    "limit": 50,
    "offset": 0,
    "sort": {},
    "filter": [
        {
            "key": "active",
            "value": true
        }
    ],
    "associations": {}
}
```

### `join`, `leave`:

Just add the specific mongoDB document `_id` to the payload you want to join/leave.

### `create`:

Expects an object payload with your entity required data.

```
{
    "_id": "6948DF80-14BD-4E04-8842-7668D9C001F1",
    "username": "test",
    "password": "alreadyHashedPassword",
    "firstName": "firstName",
    "lastName": "lastName",
    "email": "test@example.com",
    "active": true,
    "admin": true
}
```

### `delete`:

Expects an array payload with ids.

```
{
    "ids": [
        "6948DF80-14BD-4E04-8842-7668D9C001F1",
        "6948DF80-14BD-4E04-8842-7668D9C001F2",
        "6948DF80-14BD-4E04-8842-7668D9C001F3"
    ]
}
```

### `replace`, `update`:

`Replace` is replacing the whole collection entry, `update` is updating specific fields. Expects an object payload with
your entity update/replace required data.
