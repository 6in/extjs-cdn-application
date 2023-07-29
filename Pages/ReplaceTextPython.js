Ext.define('Pages.ReplaceTextPythonViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.ReplaceTextPython',
  reference: 'viewmodel',
  data: {
    title: '置換さんP',
    inputText: '',
    original: '',
    modified: ''
  }
});

Ext.define('Pages.ReplaceTextPythonController', {
  extend: 'Pages.BaseController',
  alias: 'controller.ReplaceTextPython',
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
    // const scriptBox = me.lookupReference('scriptBox')
    // const script = document.createElement("script")
    // script.type = "text/javascript";
    // script.innerHTML = me.getConst("ReplaceTextPython").iframeScript
    // scriptBox.iframe.contentWindow.document.body.appendChild(script)
  },
  onClear: function () {
    var data, m, me, ReplaceTextPython, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    try {
      vm.setData(me.getConst('ReplaceTextPython'))
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

Ext.define('Pages.ReplaceTextPython', {
  extend: 'Ext.panel.Panel',
  layout: 'border',
  controller: 'ReplaceTextPython',
  viewModel: 'ReplaceTextPython',
  bind: {
    title: '{title}'
  },
  items: [
    {
      region: 'north',
      title: '置換処理(Python)',
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
            language: 'python',
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
      ],
    },
    {
      region: 'south',
      height: 100,
      layout: 'fit',
      title: 'python',
      reference: 'python',
      split: true,
      collapsible: true,
      items: [
        {
          xtype: 'iframe',
          reference: 'scriptBox',
          src: './python.html',
          width: 'flex'
        }
      ]
    }
  ],
  listeners: {
    afterrender: 'onInitialUpdate'
  }
});
