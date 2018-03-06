# apostrophe-personas

This module helps you specialize the content of each page of an [Apostrophe site](http://apostrophecms.org) based on the user's primary affiliation. Here are good examples:

* Employee versus employer
* Trucks versus cars
* "Prosumer" versus low-end gear

Consider the employee versus employer example. Every widget on the site can be designated as universal, employee-oriented, or employer-oriented. By default, users see all of these, as the site doesn't yet know which is relevant.

But as soon as the user takes action to indicate their employee status, they see only universal widgets and employee widgets, unless they decide to switch back.

Also, pages can be designated as oriented toward one persona or the other. This can be used to avoid showing them as navigation options to uninterested parties.

Page URLs can be prefixed based on the active persona, which improves bookmarking and social sharing outcomes as well as allowing search engines to index them with different content subsets.

## Example

```javascript
// in app.js
modules: {
  'apostrophe-personas': {
    personas: [
      {
        name: 'employee',
        label: 'Employee',
        prefix: '/employee'
      },
      {
        name: 'employer',
        label: 'Employer',
        prefix: '/employer'
      }
    ]
  }
}
```

## Personas and workflow

This module can optionally be used together with the `apostrophe-workflow` module. If so, **the workflow module must be configured first.**

When workflow is present, any URL prefix for the workflow locale comes first, and the persona prefixes themselves can be localized. Here is an example.


```javascript
// in app.js
modules: {
  'apostrophe-workflow': {
    locales: [
      {
        name: 'en',
        label: 'English'
      },
      {
        name: 'fr',
        label: 'French'
      }
    ],
    prefixes: {
      'en': '/en',
      'fr': '/fr'
    }
  },
  'apostrophe-personas': {
    personas: [
      {
        name: 'employee',
        label: 'Employee',
        prefixes: {
          'en': '/employee',
          'fr': '/employé'
        }
      },
      {
        name: 'employer',
        label: 'Employer',
        prefixes: {
          'en': '/employer',
          'fr': '/employeur'
        }
      }
    ]
  }
}
```

The resulting URLs look like:

`/en/employer/about`
`/fr/employeur/about`

*Of course the admin can edit the `/about` part of the French slug to suit the language. That's an apostrophe-workflow feature.*

Both of these URLs reference the same persona, but in different locales.

Since a single doc object serves all personas, the persona prefix does not become part of the slug in the database. The URL is rewritten dynamically as needed.

## Constructing links to a specific persona

Normally, links generated to pages or pieces on the site will have the same persona prefix that is already present in the address bar for the current page.

However it is possible to create link widgets that link to a user-specified persona.

To do that, just create your own link widget as you normally do, and include a field called `linkToPersona`, for which the choices must exactly match the persona names in your `apostrophe-personas` configuration. You may also specify the value `''` (empty string) with the label `Universal`.

Make sure the widget also has a `joinByOne` or `joinByArray` field whose `withType` property is set to `apostrophe-page`, or to a piece type which has corresponding pieces-pages on the site (or otherwise generates a valid `_url` property when loaded). Note that it must be at the same level of the schema.

When you do so, `apostrophe-personas` will automatically detect this situation and correct the generated links to match the specified persona.

> Note that if you are completely overriding the `load` method of your widget without calling the original version of the method, this mechanism will not work automatically. However it is also possible to call the `addPrefix(req, personaName, url)` method of the `apostrophe-personas` module to retrieve a version of any URL that has been corrected for the specified persona.
