var _ = require('lodash');

module.exports = {
  improve: 'apostrophe-pieces',
  beforeConstruct: function(self, options) {
    if (_.includes([ 'apostrophe-users', 'apostrophe-groups', 'apostrophe-global' ], self.__meta.name)) {
      return;
    }
    if (options.personas !== false) {
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
    }
  }
};
