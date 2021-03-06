var _ = require('@sailshq/lodash');

module.exports = {

  moogBundle: {
    directory: 'lib/modules',
    modules: [
      'apostrophe-personas-areas',
      'apostrophe-personas-custom-pages',
      'apostrophe-personas-pages',
      'apostrophe-personas-widgets',
      'apostrophe-personas-doc-type-manager',
      'apostrophe-personas-pieces'
    ]
  },

  minimumNeverForcePersona: [ '/login-totp', '/setup-totp', '/confirm-totp' ],

  afterConstruct: function(self) {
    self.composePersonas();
    self.addMultiplePersonasMigration();
  },

  construct: function(self, options) {

    self.options.neverForcePersona = (options.neverForcePersona || []).concat(options.minimumNeverForcePersona || []);

    require('./lib/browser.js')(self, options);

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

    self.modulesReady = function() {
      var workflow = self.apos.modules['apostrophe-workflow'];
      var inferredAll = false;
      if (!workflow) {
        return;
      }
      _.each(self.personas, function(persona) {
        if (!persona.prefixes) {
          persona.prefixes = {};
          self.apos.utils.warn('Warning: workflow module is in use and the prefixes option is not configured for the ' + persona.name + ' persona, falling back to ' + persona.prefix + ' which will not be translated');
          inferredAll = true;
        }
        _.each(workflow.locales, function(locale, name) {
          if (name.match(/-draft$/)) {
            return;
          }
          if (!persona.prefixes[name]) {
            persona.prefixes[name] = persona.prefix || ('/' + persona.name);
            if (!inferredAll) {
              self.apos.utils.warn('Warning: workflow module is in use and the prefixes option for the ' + persona.name + ' persona has no setting for the ' + name + ' locale, falling back to ' + persona.prefix + ' which will not be translated');
            }
          }
        });
      });
    };

    self.addHelpers({
      personas: function() {
        return self.personas;
      }
    });

    // Set `req.persona` if appropriate
    self.expressMiddleware = {

      before: 'apostrophe-global',

      middleware: function(req, res, next) {

        if ((req.method !== 'GET') && (req.method !== 'HEAD')) {
          return next();
        }

        var workflow = self.apos.modules['apostrophe-workflow'];

        if (req.query.persona === 'none') {
          delete req.session.persona;
        }

        // If a user clicks on the official persona switcher, this always
        // changes their cookie immediately, no matter what the old setting was.
        // After that the persona prefix is sufficient so redirect to get
        // rid of the query
        if ((req.query.persona && _.find(self.personas, { name: req.query.persona })) || req.query.persona === 'none') {

          if (req.query.persona !== 'none') {
            req.session.nextPersona = req.query.persona;
          }

          req.url = req.url.replace(/(\?)?(&)?(persona=[^&]+)/, '$1');
          req.url = req.url.replace(/\?$/, '');
          req.url = self.addPrefix(req, req.query.persona, req.url);
          return res.redirect(req.url);
        }

        if (req.session.nextPersona) {
          if (req.session.nextPersona !== req.session.persona) {
            req.session.persona = req.session.nextPersona;
            req.data.personaSwitched = true;
          }
          delete req.session.nextPersona;
        }

        // A session could outlive a persona
        if (req.session.persona && (!_.find(self.personas, { name: req.session.persona }))) {
          delete req.session.persona;
        }

        // Find the persona suggested by the URL prefix and adjust req.url
        // after capturing that information.

        var addSlash = false;

        var urlPersona = _.find(self.personas, function(persona) {
          var prefix;
          var liveLocale = workflow && workflow.liveify(req.locale);
          var workflowPrefix = '';
          if (workflow) {
            prefix = persona.prefixes[liveLocale];
            workflowPrefix = (workflow.prefixes && workflow.prefixes[liveLocale]) || '';
          } else {
            prefix = persona.prefix;
          }
          if (req.url.substr(0, workflowPrefix.length + 1) !== (workflowPrefix + '/')) {
            // Unprefixed route like /login
            workflowPrefix = '';
          }
          if (prefix && (req.url.substr(workflowPrefix.length) === prefix)) {
            // handle /en/car as a full URL gracefully
            req.url += '/';
            addSlash = true;
            return true;
          }
          if (prefix &&
            (req.url.substr(workflowPrefix.length, prefix.length + 1) === (prefix + '/'))) {
            // The workflow prefix is really in the slug, but the
            // persona prefix is not. So snip it out to let
            // apostrophe find it in the database:
            //
            // /fr/auto/driving becomes /fr/driving
            //
            // If there is no workflow prefix the default empty
            // string just turns /auto/driving into /driving which
            // is also what we want
            req.url = req.url.substr(0, workflowPrefix.length) + req.url.substr(workflowPrefix.length + prefix.length);
            return true;
          }
        });
        urlPersona = urlPersona && urlPersona.name;
        req.urlPersona = urlPersona;
        if (addSlash) {
          return res.redirect(req.url);
        }

        // Arriving at a generic page with a persona prefix will set the persona of
        // the user immediately
        if (req.session.persona !== urlPersona) {
          req.session.persona = urlPersona;
          req.data.personaSwitched = !!urlPersona;
        }
        req.data.urlPersona = urlPersona;

        if (req.session.persona) {
          req.persona = req.session.persona;
          req.data.persona = req.persona;
        }

        return next();

      }

    };

    // Add the prefix for the given persona name to the given URL.
    // In the presence of workflow, the persona "prefix" falls between
    // the workflow prefix (already in the URL) and the rest of the URL,
    // and varies based on locale.
    //
    // If the URL already has a persona prefix it is replaced with
    // one appropriate to the given persona name.

    self.addPrefix = function(req, persona, url) {
      var workflow = self.apos.modules['apostrophe-workflow'];
      var personas = self.apos.modules['apostrophe-personas'];
      var liveLocale = workflow && workflow.liveify(req.locale);
      var workflowPrefix = (liveLocale && workflow.prefixes && workflow.prefixes[liveLocale]) || '';
      if ((require('url').parse(url).pathname || '').substr(0, workflowPrefix.length) !== workflowPrefix) {
        // Workflow prefix is not actually present, probably a route like /login
        workflowPrefix = '';
      }
      var personaInfo = (persona === 'none') ? 'none' : _.find(personas.personas, { name: persona });
      var prefix;
      if (personaInfo === 'none') {
        prefix = '';
      } else {
        prefix = workflow ? personaInfo.prefixes[liveLocale] : personaInfo.prefix;
      }

      if (url.match(/^(https?:)?\/\//)) {
        // Turn on the "slashes denote host" option
        var parsed = require('url').parse(url, false, true);
        parsed.pathname = prepend(parsed.pathname);
        return require('url').format(parsed);
      } else {
        var result = prepend(url);
        return result;
      }
      function prepend(path) {
        // Watch out for null paths in edge cases when parsing the URL
        path = path || '';
        path = path.substr(workflowPrefix.length);

        var existingPersonaPrefix = _.find(self.getAllPrefixes(req), function(prefix) {
          return path.substr(0, prefix.length + 1) === (prefix + '/');
        });

        if (existingPersonaPrefix) {
          path = path.substr(existingPersonaPrefix.length);
        }

        if (path.length) {
          return workflowPrefix + prefix + path;
        } else {
          return workflowPrefix + prefix + '/';
        }
      }

    };

    self.getAllPrefixes = function(req) {
      var workflow = self.apos.modules['apostrophe-workflow'];
      var prefixes = [];
      _.each(self.personas, function(persona) {
        if (workflow) {
          prefixes.push(persona.prefixes[workflow.liveify(req.locale)]);
        } else if (persona.prefix) {
          prefixes.push(persona.prefix);
        }
      });
      return prefixes;
    };

    // Should return true if the user is an editor
    // should bypass the normal restrictions on whether they
    // can see widgets and pieces for other personas, for
    // editing purposes. If this definition ("anyone who is
    // logged in is a potential editor") is not fine-grained
    // enough for your purposes, override this method at
    // project level. This mechanism is needed, otherwise
    // editors will accidentally erase all content for other
    // personas when an area saves
    self.userIsEditor = function(req) {
      return req.user;
    };

    self.addMultiplePersonasMigration = function() {
      self.apos.migrations.add('addMultiplePersonas', function(callback) {
        return self.apos.migrations.eachWidget({}, function(doc, widget, dotPath, callback) {
          if (!widget.personas) {
            if (widget.persona) {
              widget.personas = [ widget.persona ];
            } else {
              widget.personas = [];
            }
            delete widget.persona;
            var update = {};
            update[dotPath + '.personas'] = widget.personas;
            update[dotPath + '.persona'] = null;
            return self.apos.docs.db.update({
              _id: doc._id
            }, { $set: update }, callback);
          } else {
            return setImmediate(callback);
          }
        }, callback);
      }, { safe: true });
    };

    self.apos.define('apostrophe-cursor', require('./lib/cursor.js'));

    self.on('apostrophe-pages:notFound', 'softRedirectWithPersona', async (req) => {
      const soft = self.apos.modules['apostrophe-soft-redirects'];
      const doc = await self.apos.docs.find(req, { historicUrls: { $in: personify(req.url) } }).sort({ updatedAt: -1 }).toObject();
      if (!doc) {
        return;
      }
      if (!doc._url) {
        return;
      }
      if (soft.local(doc._url) !== req.url) {
        req.redirect = soft.local(doc._url);
        req.statusCode = soft.options.statusCode || 302;
      }
      function personify(url) {
        // URL will not contain personas yet. Personas come after
        // workflow prefixes, if any
        return self.personas.map(persona => self.addPrefix(req, persona.name, url));
      }
    });
  }
};
