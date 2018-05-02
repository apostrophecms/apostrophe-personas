# Changelog

## 2.3.0

* Support for multiple personas per widget. Note: a database migration is required. This migration does take time. However it is a safe migration (it will be executed when `apostrophe-migrations:migrate` is run with the `--safe` flag, which occurs while the previous generation of code is still live in Stagecoach deployment).
* If a `linkToPersona` schema field has an empty `choices` array, choices are automatically supplied. You may still supply your own choices if you prefer but they must match the actual persona names (or a subset of them).
* Dead code elimination.

## 2.2.1

* If the request has a persona, pieces are correctly filtered out of query results, unless that user is an editor. This change was mistakenly left out of 2.2.0.
* Two links to the same page may be made linking to different personas. Formerly reuse of objects prevented this as the code was patching the `_url` property of the same object twice.

## 2.2.0

* If the request has a persona, pieces are correctly filtered out of query results, unless that user is an editor.
* The definition of an editor varies from site to site, so the default definition ("if you are logged in, you are an editor") can now be overridden by overriding the `userIsEditor(req)` method of the module.
* Travis CI testing.
* The persona is once again switched based on a URL prefix, waiting for the second request if the user's referring URL is not on the same site, to avoid failing to show all options to a user arriving from an organic search result.

## 2.1.0

* Basic support for setting personas for pieces. So far we are not preventing them from being returned in index views of pieces or widgets for other personas, we are just making the information available and switching persona if you visit the "show" page of one.
* Helpfully infer a persona URL prefix if none is configured for a particular locale, but display a warning that it is not localized at startup.
* Do not crash on a bad persona in a session or query string.

## 2.0.2

npm packaging issues. No code changes.

## 2.0.1

License explicitly copied in. No code changes.

## 2.0.0

First npm published release, with good test coverage.
