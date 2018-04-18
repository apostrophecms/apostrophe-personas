module.exports = {
  construct: function(self, options) {
    self.addFilter('piecesByPersona', {
      def: true,
      finalize: function() {
        var personas = self.apos.modules['apostrophe-personas'];
        if (!personas) {
          // personas module is not awake yet
          console.log('asleep');
          return;
        }
        if (!self.get('piecesByPersona')) {
          console.log('not set');
          return;
        }
        var req = self.get('req');
        if (personas.userIsEditor(req)) {
          console.log('is an editor');
          return;
        }
        var persona = req.persona;
        if (!persona) {
          console.log("has no persona");
          return;
        }
        console.log("adding and");
        self.and({
          persona: { $in: [ persona, '' ] }
        });
      }
    });
  }
};
