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

* リンクアイコンのメニューは、iframe内で外部サイトを表示しています。
* 表示する場合は、chromestoreで[Ignore X-Frame Headers](https://chrome.google.com/webstore/detail/ignore-x-frame-headers/gleekbfjekiniecknbkamfmkohkpodhe)をインストールしてください。

Wiki
-------------------

* 各アプリの詳細は[こちら](https://github.com/6in/extjs-cdn-application/wiki#extjs-cdn-application)

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