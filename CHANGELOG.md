# Changelog

## 0.6.1

* Fix bug with parsing environmental variables.

## 0.6.0

* Add `Locker` and `withIdempotency` exports.
* `Journal` and `withJournal` are depricated and will be removed in the next major release.

## 0.5.0

* **⚠ BREAKING** - Expire Cloudevent idempotency key after one day by default, which may be changed through `expireAfterSeconds`.

## 0.4.1

* Update `README.md` examples.

## 0.4.0

* Add `withJournal` function to idempotently invoke AWS Lambda functions with Cloudevents.

## 0.3.0

* Change `package.json` `"type"` to `"module"`.
* Update `@1mill/mongo` from `0.0.5` to `~> 0.3.4` which may have breaking changes.
* Update `microbundle` from `~> 0.14` to `~> 0.15` and build scripts which changes how the package is bundled and may have breaking changes.
* Update `package-lock.json` `lockfileVersion` from `1` to `3`.
