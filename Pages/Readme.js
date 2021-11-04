Ext.define('Pages.ReadmeViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.Readme',
  data: {
      title: 'Readme',
      markdown: `
ExtJs CDN Application
========================


セットアップ
-------------------

* chromestoreで、[Ignore X-Frame Headers](https://chrome.google.com/webstore/detail/ignore-x-frame-headers/gleekbfjekiniecknbkamfmkohkpodhe)をインストールしてください。

  `
  },
});

Ext.define('Page.ReadmeController', {
  extend: 'Pages.BaseController',
  alias: 'controller.Readme',
  init() {
      const me = this
      me.callParent(arguments)
  }
});

Ext.define('Pages.Readme', {
  extend: 'Ext.panel.Panel',

  controller: 'Readme',
  viewModel: 'Readme',
  alias: 'widget.readme',

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
        items: {
            xtype: 'markdown',
            bind: {
                value: '{markdown}'
            }
        }
    },
  ]

});