# @1mill/journal

Idempotently invoke AWS Lambda functions with Cloudevents.

## Getting started

```bash
npm install @1mill/journal
```

```js
// * index.js
import { Locker, withIdempotency } from '@1mill/journal'

const locker = new Locker({
  name:  'my-locker-db-name',
  table: 'my-collection-name',
  uri:   'mongodb://...:27017/',
})

const func = (cloudevent, ctx) => {
  console.log('Running once: ', cloudevent)
  return { cloudevent }
}

export const handler = async (cloudevent, ctx) => withIdempotency(cloudevent, ctx, { func, locker })
```

### Locker

| Name               | Required | Types  | Default         | Environment                         | Description                                           |
|--------------------|----------|--------|-----------------|-------------------------------------|-------------------------------------------------------|
| expireAfterSeconds |          | number | `86400` (1 day) | `MILL_JOURNAL_EXPIRE_AFTER_SECONDS` | How long a Cloudevent idempotency key will keep-alive |
| name               | yes      | string |                 | `MILL_JOURNAL_NAME`                 | The name of the database itself                       |
| options            |          | object | `{}`            |                                     | Options pass to the database client                   |
| table              | yes      | string |                 | `MILL_JOURNAL_TABLE`                | The name of the table inside the database             |
| uri                | yes      | string |                 | `MILL_JOURNAL_URI`                  | URI to connect to database                            |

### withIdempotency

| Name               | Required | Types    | Default         | Environment                       | Description                                                    |
|--------------------|----------|----------|-----------------|-----------------------------------|----------------------------------------------------------------|
| func               | yes      | function |                 |                                   | The function containing business logic that will run           |
| locker             | yes      | `Locker` |                 |                                   | The `Locker` in which idempotency keys will be checked against |

## References

* <https://developer.ibm.com/tutorials/reactive-in-practice-5/>
* <https://docs.powertools.aws.dev/lambda/python/latest/utilities/idempotency/#idempotency-request-flow>
* <https://multithreaded.stitchfix.com/blog/2017/06/26/patterns-of-soa-idempotency-key/>
