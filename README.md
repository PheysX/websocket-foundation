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

### Default entities

| Entity      | Schema                                                                                                                   |
|-------------|--------------------------------------------------------------------------------------------------------------------------|
| user        | [UserSchema](https://github.com/PheysX/websocket-foundation/blob/main/src/Validation/Schema/UserSchema.js)               |
| aclRole     | [AclRoleSchema](https://github.com/PheysX/websocket-foundation/blob/main/src/Validation/Schema/AclRoleSchema.js)         |
| userAclRole | [UserAclRoleSchema](https://github.com/PheysX/websocket-foundation/blob/main/src/Validation/Schema/UserAclRoleSchema.js) |

