apos.define('apostrophe-personas', {

  construct: function(self, options) {

    self.options = options;
    self.currentPersona = options.currentPersona;
    apos.personas = self;

  }
});
