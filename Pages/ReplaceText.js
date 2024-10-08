Ext.define('Pages.ReplaceTextViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.ReplaceText',
  reference: 'viewmodel',
  data: {
    title: '置換さん',
    inputText: '',
    original: '',
    modified: ''
  }
});

Ext.define('Pages.ReplaceTextController', {
  extend: 'Pages.BaseController',
  alias: 'controller.ReplaceText',
  init: function () {
    var data, json, me, vm;
    me = this;
    me.callParent(arguments);
    vm = this.getViewModel();
    data = vm.getData();

    me.onClear();
  },
  onInitialUpdate: function () {
    var button, me;
    me = this;

    // return
    vm = me.getViewModel();

    window.addEventListener('message', event => {
      // スクリプト実行結果を表示
      me.getView().down("monacodiff").editor.getModifiedEditor().setValue(
        event.data
      )
    });

    // https://gist.github.com/jamesmcallister/c3fd8aaf0ff43942f83464da719cbcec
    const scriptBox = me.lookupReference('scriptBox')
    const script = document.createElement("script")
    script.type = "text/javascript";
    script.innerHTML = me.getConst("ReplaceText").iframeScript
    scriptBox.iframe.contentWindow.document.body.appendChild(script)
  },
  onClear: function () {
    var data, m, me, ReplaceText, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    try {
      vm.setData(me.getConst('ReplaceText'))
    } catch (_error) { }
  },
  onReplace: function (obj) {
    var data, functionText, m, me, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    functionText = data.inputText + "\n//# sourceURL=my-function.js`"
    const scriptBox = me.lookupReference('scriptBox')
    const iframe = scriptBox.iframe
    const original = me.lookupReference('diff').editor.getOriginalEditor().getValue()
    const param = {
      script: data.inputText,
      text: original
    }
    vm.setData({ original })
    me.getView().down("monacodiff").editor.getModifiedEditor().setValue(
      ""
    )
    iframe.contentWindow.postMessage(param, '*')
  }
});

Ext.define('Pages.ReplaceText', {
  extend: 'Ext.panel.Panel',
  layout: 'border',
  controller: 'ReplaceText',
  viewModel: 'ReplaceText',
  bind: {
    title: '{title}'
  },
  items: [
    {
      region: 'north',
      title: '置換処理(JavaScript)',
      height: 300,
      split: true,
      collapsible: true,
      layout: 'fit',
      reference: 'north',
      weight: 1,
      items: [
        {
          xtype: 'monaco',
          options: {
            language: 'javascript',
            minimap: {
              enabled: true
            },
            tabSize: 4,
            insertSpaces: false,
          },
          bind: {
            value: '{inputText}'
          }
        }
      ]
    }, {
      region: 'center',
      layout: 'fit',
      split: true,
      title: 'Diff',
      weight: 1,
      tbar: [
        {
          text: 'run',
          iconCls: 'fa fa-play',
          handler: 'onReplace'
        }, "->", {
          text: 'clear',
          iconCls: 'fa fa-trash-alt',
          handler: 'onClear',
        }
      ],
      items: [{
        xtype: 'monacodiff',
        reference: 'diff',
        itemId: 'diff',
        options: {
          tabSize: 4,
          insertSpaces: false,
        },
        bind: {
          original: '{original}',
          modified: '{modified}'
        }
      },
      {
        xtype: 'iframe',
        reference: 'scriptBox',
        visible: false,
      }
      ],
    }
  ],
  listeners: {
    afterrender: 'onInitialUpdate'
  }
});
