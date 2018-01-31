var _ = require('lodash');

module.exports = {

  moogBundle: {
    directory: 'lib/modules',
    modules: [ 
      'apostrophe-personas-areas',
      'apostrophe-personas-custom-pages',
      'apostrophe-personas-pages',
      'apostrophe-personas-widgets'
    ]
  },

  afterConstruct: function(self) {
    self.composePersonas();
  },

  construct: function(self, options) {

    self.composePersonas = function() {
      _.each(self.options.personas, function(persona) {
        if (!persona.label) {
          persona.label = persona.name;
        }
        if (!persona.prefix) {
          persona.prefix = '/' + persona.name;
        }
      });
      self.personas = self.options.personas;
    };

    self.addHelpers({
      personas: function() {
        return self.personas;
      }
    });

    // Set `req.persona` if appropriate. Redirect generic URLs
    // to incorporate the persona when appropriate.

    self.expressMiddleware = function(req, res, next) {
      if (req.method !== 'GET') {
        return next();
      }
      // If a user clicks on the official persona switcher, this always
      // changes their cookie immediately, no matter what the old setting was.
      // After that the persona prefix is sufficient so redirect to get
      // rid of the query
      if (req.query.persona) {
        req.session.nextPersona = req.query.persona;
        req.url = req.url.replace(/(\?)?(\&)?(persona=[^\&]+)/, '$1');
        req.url = req.url.replace(/\?$/, '');
        return res.redirect(req.url);
      }
      if (req.session.nextPersona) {
        req.session.persona = req.session.nextPersona;
        delete req.session.nextPersona;
      }

      // Find the persona suggested by the URL prefix and adjust req.url
      // after capturing that information.
      //
      // TODO: upgrade to deal with locale prefixes and persona prefix localization.
      var urlPersona = _.find(self.personas, function(persona) {
        var prefix = persona.prefix;
        if (prefix && (
          (req.url.substr(0, prefix.length) + '/') === (prefix + '/')
        )) {
          req.url = req.url.substr(prefix.length);
          return true;
        }
      });
      urlPersona = urlPersona && urlPersona.name;

      // Arriving at a generic page with a persona prefix will set the persona cookie of
      // the user only if the referring URL is ours.
      //
      // Otherwise it is assumed to be a mistake based on natural search results,
      // and their persona cookie stays unset until they express a clear preference.
      //
      // Exception: if the page is persona-specific, that does change
      // req.session.persona for the very next access (but not this one),
      // per Etienne's Scenario #2. This is implemented in pageBeforeSend of
      // pages as we don't have the page yet here.

      if (urlPersona) {
        if (ourReferrer(req)) {
          req.session.persona = urlPersona;
        }
      }
      req.data.urlPersona = urlPersona;

      // Bots always get content persona based on the prefix,
      // otherwise they would never index persona pages properly.
      // By intention, they will also index the persona switcher links.
      var agent = req.headers['user-agent'];
      if (urlPersona && agent && agent.match(/bot/i)) {
        req.session.persona = urlPersona;
      }

      if (req.session.persona && (!urlPersona)) {
        // Add the persona prefix to the URL and redirect.
        return res.redirect(_.find(self.personas, { name: req.session.persona }).prefix + req.url);
      }

      if (req.session.persona) {
        req.persona = req.session.persona;
        req.data.persona = req.persona;
      }

      return next();

      function ourReferrer(req) {
        // TODO must recognize all valid names for site, even
        // in a setup with many localized hostnames
        return req.get('Referrer') && (req.get('Referrer').indexOf(self.apos.baseUrl) === 0);
      }

    };
  }
};
