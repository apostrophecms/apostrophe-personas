var _ = require('@sailshq/lodash');

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
          // If we are an editor, but also in live mode, we want to be
          // able to view things as if we were not logged in.
          if (req.session && req.session.workflowMode === 'draft') {
            return;
          }
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
