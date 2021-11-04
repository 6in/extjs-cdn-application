Ext.define('Pages.SqlJSViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.SqlJS',
  data: {
      title: 'SqlJS',
      url: 'https://sql.js.org/examples/GUI/index.html',
  },
});

Ext.define('Page.SqlJSController', {
  extend: 'Pages.BaseController',
  alias: 'controller.SqlJS',
  init() {
      const me = this
      me.callParent(arguments)
  },
});

Ext.define('Pages.SqlJS', {
  extend: 'Ext.panel.Panel',

  controller: 'SqlJS',
  viewModel: 'SqlJS',

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