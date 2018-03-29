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
  }
};
