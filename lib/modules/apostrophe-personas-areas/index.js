var _ = require('@sailshq/lodash');

module.exports = {
  improve: 'apostrophe-areas',
  construct: function(self, options) {
    var superWidgetControlGroups = self.widgetControlGroups;
    self.widgetControlGroups = function(req, widget, options) {
      var personas = self.apos.modules['apostrophe-personas'];
      var groups = superWidgetControlGroups(req, widget, options);
      if (!widget) {
        return groups;
      }
      var choices = [
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
          label: persona.label || persona.name,
          value: persona.name
        };
      }));
      groups.push({
        classes: 'apos-widget-persona',
        // custom javascript will restructure this to do some multiple select tricks
        controls: [
          {
            name: 'personas',
            type: 'select',
            choices: choices
          }
        ]
      });
      return groups;
    };
    self.addHelpers({
      inPersona: function(widget) {
        return self.inPersona(self.apos.templates.contextReq, widget);
      }
    });
    self.inPersona = function(req, widget) {
      var persona = req.persona;
      if (!req.persona) {
        return true;
      }
      if (!(widget.personas && widget.personas.length)) {
        return true;
      }
      if (_.includes(widget.personas, persona)) {
        return true;
      }
    };
    self.apos.define('apostrophe-cursor', require('./lib/cursor.js'));
  }
};
