// This configures the apostrophe-pages module to add a "home" page type to the
// pages menu

module.exports = {

  improve: 'apostrophe-pages',

  construct: function(self, options) {
    // merge new methods with all apostrophe-cursors
    self.apos.define('apostrophe-cursor', require('./lib/anyCursor.js'));

    var superPageBeforeSend = self.pageBeforeSend;
    self.pageBeforeSend = function(req, callback) {
      var pagePersona = req.data.page && req.data.page.level && req.data.page.persona;
      if (!req.user) {
        if (pagePersona) {

          // If this page is locked down to one persona,
          // set the persona for the next access per Etienne's scenario #2
          // (but don't set req.persona now unless the referrer is ours,
          // look carefully at scenario #2 step 1)
          req.session.persona = req.data.page.persona;
          if (ourReferrer(req)) {
            req.persona = req.session.persona;
            req.data.persona = req.session.persona;
          }
        }
      }
      // dgad-303: if the page and the URL: both have an explicit persona
      // and they don't match, redirect to the page's persona
      if (pagePersona && req.urlPersona && (req.urlPersona !== pagePersona)) {
        var personas = self.apos.modules['apostrophe-personas'];
        return req.res.redirect(personas.addPrefix(req, req.data.page.persona, req.url));
      }
      return superPageBeforeSend(req, callback);
      function ourReferrer(req) {
        return req.get('Referrer') && (req.get('Referrer').indexOf(self.apos.baseUrl) === 0);
      }
    };

    self.addHelpers({
      suitsPersona: function(page, persona) {
        return self.suitsPersona(page, persona);
      }
    });

    self.suitsPersona = function(page, persona) {
      if (!persona) {
        return true;
      }
      if (!page.persona) {
        return true;
      }
      return page.persona === persona;
    };
  }
};
