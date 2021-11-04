Ext.define('Pages.FontAwesomeViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.FontAwesome',
  data: {
      title: 'FontAwesome',
      url: 'https://fontawesome.com/v5.15/icons?d=gallery',
  },
});

Ext.define('Page.FontAwesomeController', {
  extend: 'Pages.BaseController',
  alias: 'controller.FontAwesome',
  init() {
      const me = this
      me.callParent(arguments)
  },
});

Ext.define('Pages.FontAwesome', {
  extend: 'Ext.panel.Panel',

  controller: 'FontAwesome',
  viewModel: 'FontAwesome',

  bind: {
      title: '{title}'
  },

  layout: {
      type: 'border',
  },

  items: [
      {
          region: 'center',
          layout: 'fit',
          flex: 0.1,
          items: {
              xtype: 'iframe',
              bind: {
                  src: '{url}'
              },
          }
      },
  ]

});