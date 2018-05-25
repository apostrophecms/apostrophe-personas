var _ = require('@sailshq/lodash');

module.exports = {
  construct: function(self, options) {

    // Modify `_url` to account for the effective persona, which is
    // that of the user unless that persona is incompatible with the page,
    // in which case it is the first persona compatible with the page.

    self.addFilter('pageUrlPersona', {
      def: true,
      after: function(results) {
        var personas = self.apos.modules['apostrophe-personas'];
        _.each(results, function(result) {
          if (self.apos.pages.isPage(result) && result._url) {
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
