apos.define('apostrophe-areas-editor', {
  construct: function(self, options) {
    var superEnhanceWidgetControls = self.enhanceWidgetControls;
    self.enhanceWidgetControls = function($widget) {
      superEnhanceWidgetControls($widget);
    };
    var superRegisterClickHandlers = self.registerClickHandlers;
    self.registerClickHandlers = function() {
      superRegisterClickHandlers();
      self.$el.on('change', '[name="persona"]', self.startAutosavingHandler(self.changedPersona));
    };
    self.changedPersona = function(event) {
      var $el = $(event.target);
      var $widget = $el.closest('[data-apos-widget]');
      var persona = $el.val();
      var data = apos.areas.getWidgetData($widget);
      data.persona = persona;
      apos.areas.setWidgetData($widget, data);
      return false;
    };
  }
});
