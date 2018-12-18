var _ = require('@sailshq/lodash');

module.exports = {
  construct: function(self, options) {
    self.addFilter('piecesByPersona', {
      def: true,
      finalize: function() {
        var personas = self.apos.modules['apostrophe-personas'];
        if (!personas) {
          // personas module is not awake yet
          return;
        }
        if (!self.get('piecesByPersona')) {
          return;
        }
        if (!_.find(self.options.module.schema, { name: 'persona' })) {
          return;
        }
        var req = self.get('req');
        if (personas.userIsEditorAndWantToSeeAll(req)) {
          return;
        }
        var persona = req.persona;
        if (!persona) {
          return;
        }
        self.and({
          $or: [
            {
              persona: { $exists: 0 }
            },
            {
              persona: { $in: [ persona, '' ] }
            }
          ]
        });
      }
    });
  }
};
