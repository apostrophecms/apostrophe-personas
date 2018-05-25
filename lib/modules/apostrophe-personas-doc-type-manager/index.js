var _ = require('@sailshq/lodash');

module.exports = {
  improve: 'apostrophe-doc-type-manager',
  construct: function(self, options) {
    // Because new modules for standard page template types with no custom code
    // are defined after modulesReady, by a modulesReady handler, those
    // will never see modulesReady
    self.afterInit = function() {
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
