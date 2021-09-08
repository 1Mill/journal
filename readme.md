# @1mill/journal

## Context

<https://awslabs.github.io/aws-lambda-powertools-python/latest/utilities/idempotency/#idempotency-request-flow>

## Install

```bash
npm install @1mill/journal
```

```js
// * index.js
const { Journal } = require('@1mill/journal')

const journal = new Journal({
  db: {
    name: 'development' || process.env.JOURNAL_DB_NAME,
    uri: 'mongodb://...:27017/' || process.env.JOURNAL_DB_URI,
  },
  tableName: 'my.table.name' || process.env.JOURNAL_TABLE_NAME,
})

// cloudevent = {
//   id: String,
//   source: String,
//   type: String,
//   ...
// }
export.handler = async (cloudevent, ctx) => {
  // * https://www.jeremydaly.com/reuse-database-connections-aws-lambda/
  ctx.callbackWaitsForEmptyEventLoop = false

  try {
    const { skip } = await journal.entry({ cloudevent })
    if (skip) return // * Already being performed by another lambda

    // * Perform business logic
    // ...
  } catch (err) {
    console.error(err)
    // * Erase entry on business logic failure (e.g. fetch to
    // * third-party API failed)
    await journal.erase({ cloudevent })
    throw new Error(err) // * Requeue event to run again
  }
}

```
