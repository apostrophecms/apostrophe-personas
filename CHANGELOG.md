# Changelog

## 3.0.3

* Compatible with Apostrophe's "soft redirects" feature. When the slug of a page or piece that has a persona has been changed, Apostrophe can now redirect to the new slug, as long as nothing else has laid claim to the old one. Normally a standard feature, formerly this did not work in the presence of this module.

## 3.0.2

* Run the personas middleware on HEAD requests as well. Thanks to Michelin for making this work possible via [Apostrophe Enterprise Support](https://apostrophecms.org/support/enterprise-support).

## 3.0.1

* Universal pages now display widgets of *all* personas. Prior to this, universal pages only showed `universal` and `none`. This is because in `3.0.0`, the persona `none` was recognized as a real persona. Both `none` and `universal` both have no url prefix. However, `universal` personas persist among all personas, whereas `none` is only available when there is no prefix set, or `No Persona` is selected. 
* If you are in `live` mode, you will now see the correct widgets on the page, depending on the selected persona.
* Additional bug fixes were made for giving visual indication in `draft` mode for which widgets correspond to the selected persona.

## 3.0.0

> The version number of this module is **not** related to the version
of ApostropheCMS it is compatible with. It is still intended for
use with Apostrophe 2.x.

* SEO fix (and a bc break, thus a new major version): personas are indicated via a URL prefix consistently, for correct SEO. That is, if your current persona is `auto`, there will always be a corresponding URL prefix.
* Still stores the current persona in `req.session.persona` for backward compatibility and to implement the `req.data.personaSwitched` mechanism.
* The persona `none` is now a real persona, with no prefix in the urls.
* Permanent redirections (301) are made if the page or piece has a specified persona and the persona prefix of the URL does not match the page/piece persona.
* If a universal page is requested with no persona prefix, and the option `disableEmptyUniversal` is set to `true`, redirects to `options.defaultPersonaByLocale` (an object with values for each locale), or to `options.defaultPersona`, or finally to the first configured persona.
* Author will be able to select persona `none` in documents for global content.
* Added a `isPersonaUniversalContext` in `req.data` indicating if the current page has an universal persona (useful for persona switcher display in authoring).

Thanks to Michelin for their engagement with this development.

## 2.3.8

* Do not crash if the pathname portion of a URL is somehow null.

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
