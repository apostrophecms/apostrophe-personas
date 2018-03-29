var _ = require('lodash');

module.exports = {
  construct: function(self, options) {
    self.addFilter('addPersonaUrl', {
      after: function(results) {
        var personas = self.apos.modules['apostrophe-personas'];
        _.each(results, function(result) {
          if ((!self.apos.pages.isPage(result)) && result.persona && result._url) {
            var req = self.get('req');
            var effectivePersona;
            if (req.persona && self.apos.pages.suitsPersona(result, req.persona)) {
              effectivePersona = req.persona;
            } else if (result.persona) {
              effectivePersona = result.persona;
            }
            if (effectivePersona) {
              result._url = personas.addPrefix(req, effectivePersona, result._url);
            }
          }
        });
      }
    });
  }
};
