# Changelog

## 3.0.0

* No more automatic persona switching based on previous requests (session)
* Still put the current persona in `req.session` for backward compatibility
* The persona `none` is now a real persona with no prefix in the urls
* Permanent redirections are made if the request persona prefix does not match the page/piece persona
* If a universal page is requested with no persona prefix, redirect to the first persona available
* Author now no more see persona based content in not on the persona path unless asking it with a `showAll` parameter
* Author will be able to select persona `none` in documents for global content
* Added a `isPersonaUniversalContext` in `req.data` indicating if the current page has an universal persona (useful for persona switcher display in authoring)

## 2.3.7

* When switching persona based on a page URL, check the relevance of the referring URL via the shared implementation that understands workflow, not a dusty copy of an older version of that function.

## 2.3.6

* When the persona has just changed from the user's perspective, `req.data.personaSwitched` is set to true for that one request so that page templates can call attention to the change.

## 2.3.5

* When setting `nextPersona`, we should also delete `req.sessions.persona`. This prevents a stale persona setting from causing a 404 if we follow an organic search result link, email link or manually pasted URL that leads to a page with a different persona prefix and is locked down to that prefix.

## 2.3.4

* Referring URL check is now compatible with the `hostnames` option of `apostrophe-workflow`, ensuring that the persona prefix is accepted on the first access as long as it comes from a relevant site. If you are implementing any other kind of multisite system, you will want to override the `ourReferrer` method at project level to make the test more inclusive.

## 2.3.3

* Security: npm audit passing.

## 2.3.2

* Persona middleware now runs before `apostrophe-global` middleware, so that persona-based URL generation can be applied properly to content loaded by that middleware.

## 2.3.1

* Fixed very short-lived bug that broke the display of universal widgets while a persona is in effect.

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
