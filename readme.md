# @1mill/journal

Idempotently invoke AWS Lambda functions with Cloudevents as outlined in <https://docs.powertools.aws.dev/lambda/python/latest/utilities/idempotency/#idempotency-request-flow>.

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
