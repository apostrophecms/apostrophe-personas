// This configures the apostrophe-pages module to add a "home" page type to the
// pages menu

module.exports = {

  improve: 'apostrophe-pages',

  construct: function(self, options) {
    // merge new methods with all apostrophe-cursors
    self.apos.define('apostrophe-cursor', require('./lib/anyCursor.js'));

    var superPageBeforeSend = self.pageBeforeSend;
    self.pageBeforeSend = function(req, callback) {
      var pagePersona = (req.data.piece && req.data.piece.persona) || (req.data.page && req.data.page.level && req.data.page.persona);
      if (!req.user) {
        if (pagePersona) {
          // If this page or piece is locked down to one persona,
          // set the persona for the next access per Etienne's scenario #2
          // (but don't set req.persona now unless the referrer is ours,
          // look carefully at scenario #2 step 1)
          var changed = req.persona !== pagePersona;
          if (changed) {
            if (ourReferrer(req)) {
              req.session.persona = pagePersona;
              req.persona = req.session.persona;
              req.data.persona = req.session.persona;
              req.data.personaSwitched = true;
            } else {
              req.session.nextPersona = pagePersona;
            }
          }
        }
      }
      // dgad-303: if the page/piece and the URL both have an explicit persona
      // and they don't match, redirect to the page/piece's persona
      if (pagePersona && req.urlPersona && (req.urlPersona !== pagePersona)) {
        var personas = self.apos.modules['apostrophe-personas'];
        return req.res.redirect(personas.addPrefix(req, pagePersona, req.url));
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
