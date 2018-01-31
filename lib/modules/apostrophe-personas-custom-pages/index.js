var _ = require('lodash');

module.exports = {
  improve: 'apostrophe-custom-pages',
  beforeConstruct: function(self, options) {
    options.addFields = [
      {
        type: 'select',
        name: 'persona',
        // choices patched in later when personas module wakes up
        choices: []
      }
    ].concat(options.addFields || []);
    options.arrangeFields = [
      {
        name: 'persona',
        label: 'Persona',
        fields: [ 'persona' ]
      }
    ].concat(options.arrangeFields || []);
  },
  construct: function(self, options) {
    self.modulesReady = function() {
      self.setChoices();
    };
    self.setChoices = function() {
      var personas = self.apos.modules['apostrophe-personas'];
      var personaField = _.find(self.schema, { name: 'persona' });
      if (!personaField) {
        return;
      }
      personaField.choices = [
        {
          label: 'Universal',
          value: ''
        }
      ].concat(_.map(personas.personas, function(persona) {
        return {
          label: persona.label,
          value: persona.name
        };
      }));
    };
  }
};
