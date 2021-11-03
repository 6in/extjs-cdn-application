Ext.define('Pages.ComponentSampleViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.FontAwesome',
  data: {
      title: 'FontAwesome',
      url: 'https://fontawesome.com/v5.15/icons?d=gallery',
  },
});

Ext.define('Page.ComponentSampleController', {
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

  // iconCls: 'fa fa-ambulance',

  bind: {
      title: '{title}'
  },

  layout: {
      type: 'border',
  },

  items: [
      {
          region: 'center',
          title: 'Gallery',
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