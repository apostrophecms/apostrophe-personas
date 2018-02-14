var _ = require('lodash');

module.exports = {
  construct: function(self, options) {
    self.addFilter('personas', {
      def: true,
      after: function(results) {
        if (!self.get('personas')) {
          return;
        }
        var req = self.get('req');
        if (req.user) {
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
