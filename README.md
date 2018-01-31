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

Both of these URLs reference the same persona, but in different locales.

Since a single doc object serves all personas, the persona prefix does not become part of the slug in the database. The URL is rewritten dynamically as needed.
