# @1mill/journal

Idempotently invoke AWS Lambda functions with Cloudevents.

## Getting started

```bash
npm install @1mill/journal
```

```js
// * index.js
const { Journal, withJournal } = require('@1mill/journal')

const journal = new Journal({
  name:  'my-journal-db' || process.env.MILL_JOURNAL_NAME,
  table: 'my-collection' || process.env.MILL_JOURNAL_TABLE,
  uri:   'mongodb://...:27017' || process.env.MILL_JOURNAL_URI,
})

const func = (cloudevent, ctx) => {
  console.log('Running once: ', cloudevent)
}

export.handler = async (cloudevent, ctx) => withJournal(cloudevent, ctx, { func, journal })
```

| Name               | Required | Types  | Default         | Environment                         | Description                                           |
|--------------------|----------|--------|-----------------|-------------------------------------|-------------------------------------------------------|
| expireAfterSeconds |          | number | `86400` (1 day) | `MILL_JOURNAL_EXPIRE_AFTER_SECONDS` | How long a Cloudevent idempotency key will keep-alive |
| name               | yes      | string |                 | `MILL_JOURNAL_NAME`                 | The name of the database itself                       |
| options            |          | object | `{}`            |                                     | Options pass to the database client                   |
| table              | yes      | string |                 | `MILL_JOURNAL_TABLE`                | The name of the table inside the database             |
| uri                | yes      | string |                 | `MILL_JOURNAL_URI`                  | URI to connect to database                            |

## References

* <https://docs.powertools.aws.dev/lambda/python/latest/utilities/idempotency/#idempotency-request-flow>
* <https://multithreaded.stitchfix.com/blog/2017/06/26/patterns-of-soa-idempotency-key/>
