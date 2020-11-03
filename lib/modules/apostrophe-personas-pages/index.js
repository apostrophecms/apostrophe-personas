// This configures the apostrophe-pages module to add a "home" page type to the
// pages menu

module.exports = {

  improve: 'apostrophe-pages',

  construct: function(self, options) {
    // merge new methods with all apostrophe-cursors
    self.apos.define('apostrophe-cursor', require('./lib/anyCursor.js'));

    var superPageBeforeSend = self.pageBeforeSend;
    self.pageBeforeSend = function(req, callback) {
      var pagePersona = (req.data.piece && req.data.piece.persona) || (req.data.page && req.data.page.persona);
      req.data.isPersonaUniversalContext = !pagePersona;
      // If the page/piece and the URL both have an explicit persona
      // and they don't match, redirect to the page/piece's persona
      // (none persona is here considered as explicit and should have no persona prefix)
      // If the page/piece has universal persona and requested with no persona prefix and disableEmptyUniversal is truthy
      // Redirect to:
      // - defaultPersonaByLocale or
      // - defaultPersona or
      // - first available persona
      var currentPersona = req.urlPersona || 'none';
      if (currentPersona !== pagePersona) {
        var personas = self.apos.modules['apostrophe-personas'];
        if (!pagePersona && !req.urlPersona && personas.personas[0] && personas.options.disableEmptyUniversal) {
          pagePersona = personas.options.defaultPersona || personas.personas[0].name;
          var workflow = self.apos.modules['apostrophe-workflow'];
          if (workflow && personas.options.defaultPersonaByLocale) {
            pagePersona = personas.options.defaultPersonaByLocale[workflow.liveify(req.locale)] || pagePersona;
          }
        }
        if (pagePersona) {
          return req.res.redirect(301, personas.addPrefix(req, pagePersona, req.url));
        }
      }
      return superPageBeforeSend(req, callback);
    };

    self.addHelpers({
      suitsPersona: function(page, persona) {
        return self.suitsPersona(page, persona);
      }
    });

    self.suitsPersona = function(page, persona) {
      if (!persona) {
        return false;
      }
      if (!page.persona) {
        return true;
      }
      return page.persona === persona;
    };
  }
};
