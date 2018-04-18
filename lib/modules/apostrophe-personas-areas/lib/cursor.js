var _ = require('lodash');

module.exports = {
  construct: function(self, options) {
    self.addFilter('personas', {
      def: true,
      after: function(results) {
        var personas = self.apos.modules['apostrophe-personas'];
        if (!personas) {
          // personas module is not awake yet
          return;
        }
        if (!self.get('personas')) {
          return;
        }
        var req = self.get('req');
        if (personas.userIsEditor(req)) {
          return;
        }
        _.each(results, function(doc) {
          self.apos.areas.walk(doc, function(area, dotPath) {
            area.items = _.filter(area.items, function(widget) {
              return self.apos.areas.inPersona(req, widget);
            });
          });
        });
      }
    });
  }
};
