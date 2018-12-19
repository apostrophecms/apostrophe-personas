module.exports = function(self, options) {

  self.pushAsset('script', 'always', { when: 'always' });

  self.pageBeforeSend = function(req) {
    self.pushCreateSingleton(req, 'always');
  };

  self.getCreateSingletonOptions = function(req) {
    return {
      currentPersona: req.persona
    };
  };
};
