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
  init: function() {
    var data, json, me, vm;
    me = this;
    me.callParent(arguments);
    vm = this.getViewModel();
    data = vm.getData();

    me.onClear();
  },
  onInitialUpdate: function() {
    var button, me;
    me = this;

    // return
    vm = me.getViewModel();

    window.addEventListener('message', event => {
      debugger
      // スクリプト実行結果を表示
      vm.setData({modified: event.data})
    });

    // https://gist.github.com/jamesmcallister/c3fd8aaf0ff43942f83464da719cbcec
    const scriptBox = me.lookupReference('scriptBox')
    const script = document.createElement("script")
    script.type = "text/javascript";
    script.innerHTML = me.getConst("ReplaceText").iframeScript
    scriptBox.iframe.contentWindow.document.body.appendChild(script)
  },
  onClear: function() {
    var data, m, me, ReplaceText, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    try {
      vm.setData(me.getConst('ReplaceText'))
    } catch (_error) {}
  },
  onReplace: function(obj) {
    var data, functionText, m, me, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    functionText = data.inputText + "\n//# sourceURL=my-function.js`"
    
    debugger
    const scriptBox = me.lookupReference('scriptBox')
    const iframe = scriptBox.iframe
    const original = me.lookupReference('diff').editor.getOriginalEditor().getValue()
    const param = {
      script: data.inputText,
      text: original
    }
    vm.setData({original})
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
              }
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
          handler: 'onReplace'
        }, "->", {
          text: 'clear',
          handler: 'onClear',
        }
      ],
      items: [{
        xtype: 'monacodiff',
        reference: 'diff',
        itemId: 'diff',
        bind: {
            original: '{original}',
            modified: '{modified}'
        }
      },
      {
        xtype: 'iframe',
        reference: 'scriptBox',
        visible: false
      }
      ],
    }
  ],
  listeners: {
    afterrender: 'onInitialUpdate'
  }
});
