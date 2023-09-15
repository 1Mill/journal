# @1mill/journal

## Context

<https://docs.powertools.aws.dev/lambda/python/latest/utilities/idempotency/#idempotency-request-flow>

## Install

```bash
npm install @1mill/journal
```

```js
// * index.js
const { Journal } = require('@1mill/journal')

const journal = new Journal({
  name: 'my-journal-db' || process.env.MILL_JOURNAL_NAME,
  table: 'my-collection' || process.env.MILL_JOURNAL_TABLE,
  uri: 'mongodb://...:27017' || process.env.MILL_JOURNAL_URI,
})

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
