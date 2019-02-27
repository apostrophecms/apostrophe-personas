var _ = require('@sailshq/lodash');

module.exports = {
  improve: 'apostrophe-widgets',
  beforeConstruct: function(self, options) {
    options.addFields = [
      {
        type: 'checkboxes',
        name: 'personas',
        // choices patched in later when personas module wakes up
        choices: [],
        contextual: true
      }
    ].concat(options.addFields || []);
    options.arrangeFields = [
      {
        name: 'personas',
        label: 'Personas',
        fields: [ 'personas' ]
      }
    ].concat(options.arrangeFields || []);
  },
  construct: function(self, options) {
    self.modulesReady = function() {
      self.setChoices();
    };
    self.setChoices = function() {
      var personas = self.apos.modules['apostrophe-personas'];
      var personaField = _.find(self.schema, { name: 'personas' });
      if (personaField) {
        personaField.choices = [
          {
            label: 'Universal',
            value: ''
          },
          {
            label: 'No Persona',
            value: 'none'
          }
        ].concat(_.map(personas.personas, function(persona) {
          return {
            label: persona.label,
            value: persona.name
          };
        }));
      }
      var linkToPersonaField = _.find(self.schema, { name: 'linkToPersona' });
      if (linkToPersonaField && !(linkToPersonaField.choices && linkToPersonaField.choices.length)) {
        linkToPersonaField.choices = [
          {
            label: 'Unspecified',
            value: ''
          },
          {
            label: 'No Persona',
            value: 'none'
          }
        ].concat(_.map(personas.personas, function(persona) {
          return {
            label: persona.label,
            value: persona.name
          };
        }));
      }
    };
    var superGetWidgetClasses = self.getWidgetClasses;
    self.getWidgetClasses = function(widget) {
      if (!self.apos.areas.inPersona(self.apos.templates.contextReq, widget)) {
        return superGetWidgetClasses(widget);
      }
      return superGetWidgetClasses(widget).concat([ 'apos-area-widget-in-persona' ]);
    };

    // If a widget has a linkToPersona field in its schema, and
    // also a join field that joins withType apostrophe-page,
    // update the _url based on linkToPersona. Otherwise leave it
    // alone

    var superLoad = self.load;
    self.load = function(req, widgets, callback) {
      return superLoad(req, widgets, function(err) {
        if (err) {
          return callback(err);
        }
        if (!_.find(self.schema, { name: 'linkToPersona' })) {
          return callback(null);
        }
        var join = _.find(self.schema, function(field) {
          return field.type.match(/^join/) && field.withType === 'apostrophe-page';
        });
        if (!join) {
          console.error('schema has linkToPersona, but no join. Must be at same level.');
          return callback(null);
        }
        _.each(widgets, function(widget) {
          if (!widget.linkToPersona) {
            return;
          }
          if (widget[join.name]) {
            fixPersona(widget, join.name, widget[join.name]);
          }
          function fixPersona(context, contextKey, object) {
            var personas = self.apos.modules['apostrophe-personas'];
            _.each(object, function(val, key) {
              if (key === '_url') {
                // Shallow clone because there could be two joins
                // to the same page; object reuse was fine until now,
                // but they could have different personas and thus
                // the `_url` property needs to differ
                context[contextKey] = _.clone(object);
                context[contextKey][key] = personas.addPrefix(req, widget.linkToPersona, val);
              }
              if ((typeof val) === 'object') {
                fixPersona(object, key, val);
              }
            });
          }
        });
        return callback(null);
      });
    };
  }
};
