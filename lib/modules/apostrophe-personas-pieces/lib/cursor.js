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
        var req = self.get('req');
        if (personas.userIsEditor(req)) {
          return;
        }
        var persona = req.persona;
        if (!persona) {
          return;
        }
        self.and({
          persona: { $in: [ persona, '' ] }
        });
      }
    });
  }
};
