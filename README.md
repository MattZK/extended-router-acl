# Extended Router ACL
Resource based Express ACL Middleware

index.ts
```ts
import express from 'express';
import { authorize, config } from 'extended-router-acl';

const app = express();

config({
  file: 'acl.yml',
});

app.use(authorize);

app.use('/', (req, res) => res.send({ ... }));
app.use('/books', (req, res) => res.send({ ... }));

app.listen(3000);
```

acl.yml
```yml
- resource: /
  permissions:
    public:
      - GET
- resource: /books
  permissions:
    admin:
      - GET
      - POST
      - DELETE
```

## Features
- Resource based ACL
- Public route handling
- Hooking functions

## Docs
soon

## License
[MIT](LICENSE)