Ext.define('Pages.YamlJsonConverterViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.YamlJsonConverter',
  reference: 'viewmodel',
  data: {
    title: 'Yaml↔Json変換さん',
    txtInput: 'key_name: value',
    txtOutput: '',
    tabSize: 2,
    jsonlMode: false
  }
});

Ext.define('Pages.YamlJsonConverterController', {
  extend: 'Pages.BaseController',
  alias: 'controller.YamlJsonConverter',
  init: function () {
    var data, json, me, vm;
    me = this;
    me.callParent(arguments);
    vm = this.getViewModel();
    data = vm.getData();

    return me.toJson();
  },
  toJson: function () {
    var data, jsonData, me, tabSize, vm, yaml;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    if (data.jsonlMode) {

      const text = jsyaml.load(data.txtInput).map( line => {
        return JSON.stringify(line)
      }).join("\n")

      return vm.setData({
        txtOutput: text
      });

    } else {
      tabSize = data.tabSize;
      yaml = data.txtInput;
      jsonData = jsyaml.load(yaml);
      return vm.setData({
        txtOutput: JSON.stringify(jsonData, null, tabSize)
      });
    }
  },
  toYaml: function () {
    var jsonData, me, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    if (data.jsonlMode) {
      jsonData = data.txtOutput.split(/\r?\n/).filter(line => line.trim() !== "").map( line => JSON.parse(line))
    } else {
      jsonData = JSON.parse(data.txtOutput);
    }

    return vm.setData({
      txtInput: jsyaml.dump(jsonData)
    });
  },
  toPretty: function () {
    var data, jsonData, me, tabSize, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    tabSize = data.tabSize;
    jsonData = JSON.parse(data.txtOutput);
    return vm.setData({
      txtOutput: JSON.stringify(jsonData, null, tabSize)
    });
  },
  toUgly: function () {
    var jsonData, me, vm;
    me = this;
    vm = me.getViewModel();
    jsonData = JSON.parse(vm.getData().txtOutput);
    return vm.setData({
      txtOutput: JSON.stringify(jsonData)
    });
  },
  getTokens: function (line) {
    var tokens;
    if (line.match(/^([a-zA-Z][a-zA-Z0-9]+)([A-Z][a-zA-Z0-9]+)*$/)) {
      tokens = line.split(/([A-Z][a-z0-9]+)/);
      if (tokens.length === 1) {
        return tokens;
      }
      return tokens.filter(function (token) {
        return token !== "";
      });
    } else if (line.match(/^([a-zA-Z][a-zA-Z0-9]*)(_[a-zA-Z0-9]+)*$/)) {
      if (line.indexOf("_") === -1) {
        return [line];
      }
      return line.split(/_/);
    }
  },
  toCamelCase: function () {
    var data, me, tabSize, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    tabSize = data.tabSize;
    return vm.setData({
      txtInput: data.txtInput.split(/\n/g).map(function (line) {
        var key, spc, val;
        if (line.match(/^([\s\-]*)(\w+)(:.*)$/)) {
          spc = RegExp.$1;
          key = RegExp.$2;
          val = RegExp.$3;
          console.log(key);
          key = me.getTokens(key).map(function (token) {
            token = token.toLowerCase();
            return token[0].toUpperCase() + token.slice(1);
          }).join("");
          key = key[0].toLowerCase() + key.slice(1);
          line = spc + key + val;
          
        }
        return line;
      }).join("\n")
    });
  },
  toSnakeCase: function () {
    var data, me, tabSize, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    tabSize = data.tabSize;
    return vm.setData({
      txtInput: data.txtInput.split(/\n/g).map(function (line) {
        var key, spc, val;
        if (line.match(/^([\s\-]*)(\w+)(:.*)$/)) {
          spc = RegExp.$1;
          key = RegExp.$2;
          val = RegExp.$3;
          key = me.getTokens(key).map(function (token) {
            return token.toLowerCase();
          }).join("_");
          line = spc + key + val;
        }
        return line;
      }).join("\n")
    });
  },
  onChangeJSONLMode (obj,value) {
    var data, me, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    
    if (me.silent) {
      if (value) {
        vm.setData({
          jsonlMode: true,
          txtInput: '',
          txtOutput: ''
        })
        me.lookupReference("txtOutput").editor.updateOptions({wordWrap: "on"})
      } else {
        vm.setData({
          jsonlMode: false,
          txtInput: 'key_name: value',
          txtOutput: ''
        })
        me.lookupReference("txtOutput").editor.updateOptions({wordWrap: "off"})
      }
    }
    else if (value) {
      me.alert("確認","JSONLモードに変更します。テキストは初期値が設定されます。").then( ok => {
        vm.setData({
          jsonlMode: true,
          txtInput: '',
          txtOutput: '{"id": 1}\n{"id": 2}'
        })
        me.lookupReference("txtOutput").editor.updateOptions({wordWrap: "on"})
        me.toYaml()
      })
    } else {
      me.alert("確認","JSONLモードを解除します。テキストは初期値が設定されます。").then( ok => {
        vm.setData({
          jsonlMode: false,
          txtInput: 'key_name: value',
          txtOutput: ''
        })
        me.lookupReference("txtOutput").editor.updateOptions({wordWrap: "off"})
      })
    }
  },
  onEscapeJson() {
    var data, me, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();

    const result = JSON.stringify(JSON.stringify(JSON.parse(data.txtOutput)))
    console.log(result)

    const win = Ext.create("Ext.window.Window",{
      title: 'Escape JSON',
      width: 800,
      height: 600,
      closable: true,
      modal: true,
      layout: 'fit',
      items: {
        xtype: 'monaco',
        options: {
          value: result
        }
      }      
    })
    win.show()   
  },
  onUnescapeJson() {
    var data, me, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();

    const win = Ext.create("Ext.window.Window",{
      title: 'Unescape JSON',
      width: 800,
      height: 600,
      closable: true,
      modal: true,
      layout: 'fit',
      items: {
        xtype: 'monaco',
        options: {
          value: 'エスケープされたJSONを貼り付け後、取り込みボタンをクリック'
        }
      },
      buttons: [{
        text: '取り込み',
        handler() {
          debugger
          let text = JSON.parse(win.down("monaco").getValue())
//          text = text.replace(/\\"/g, '"')
          vm.setData({txtOutput: text})
          win.close()
        }
      }
      ]
    })
    win.show()   
  },
  onTxtOutputAfterrender() {
    const me = this
    const txtBoxes = ['txtInput', 'txtOutput']
    txtBoxes.forEach( (txt) => {
      me.lookupReference(txt).getEl().dom.addEventListener('drop', (e) => {
        e.stopPropagation()
        e.preventDefault()
        me.readDropFile(e,txt)
      }
      , false
      )
    })
  }, 
  readDropFile(event,txt) {
    const me = this
    const vm = me.getViewModel()
    console.log(txt)
    
    const items = event.dataTransfer.items
    if (items.length !== 1) {
      return 
    }

    const item = items[0]
    if (item.kind !== 'file') {
      return
    }

    if (txt === 'txtOutput' && event.dataTransfer.files[0].name.endsWith('.jsonl')) {
      me.silent = true
      vm.setData({jsonl: true})
    }

    let fileName = ""
    // FileSystemFileHandle オブジェクトを取得
    item.getAsFileSystemHandle().then( (handle) => {
      handle.queryPermission({mode: 'read'})
      return handle
    }).then( (handle) => {
      return handle.getFile()
    }).then( (file) => {
      console.log(file.name)
      return file.text()
    }).then( (text) => {
      vm.setData({
        [txt]: text 
      })
      me.silent = false
      me.toYaml()
    })
  },

});

Ext.define('Pages.YamlJsonConverter', {
  extend: 'Ext.panel.Panel',
  layout: 'border',
  controller: 'YamlJsonConverter',
  viewModel: 'YamlJsonConverter',

  bind: {
    title: '{title}'
  },

  listeners: {
    afterrender: 'onTxtOutputAfterrender',
    fileDrop: 'onFileDrop',
  },

  items: [
    {
      region: 'west',
      title: 'Yaml',
      width: "50%",
      split: true,
      layout: 'fit',
      tbar: [
        {
          text: 'convert to snake case',
          handler: 'toSnakeCase'
        }, {
          text: 'convert to camel case',
          handler: 'toCamelCase'
        }, '->', {
          text: 'convert',
          handler: 'toJson'
        }
      ],
      items: [
        {
          xtype: 'monaco',
          reference: 'txtInput',
          options: {
            language: 'yaml',
            minimap: {
              enabled: true
            }
          },
          bind: {
            value: '{txtInput}'
          }
        }
      ]
    }, {
      region: 'center',
      title: 'Json',
      layout: 'fit',
      tbar: [
        {
          text: 'convert',
          handler: 'toYaml'
        }, {
          text: 'pretty',
          handler: 'toPretty'
        }, {
          text: 'ugly',
          handler: 'toUgly'
        }, {
          label: 'tab size',
          xtype: 'numberfield',
          bind: {
            value: '{tabSize}'
          },
          width: 100
        }, {
          text: 'jsonl',
          xtype: 'checkbox',
          boxLabel: 'JSONL mode',
          listeners: {
            change: 'onChangeJSONLMode'
          },
          bind: {
            value: '{jsonl}'
          }
        },{
          text: 'Escape JSON',
          handler: 'onEscapeJson'
        },{
          text: 'Unescape JSON',
          handler: 'onUnescapeJson'
        }
      ],
      items: [
        {
          xtype: 'monaco',
          options: {
            language: 'json',
            minimap: {
              enabled: true
            }
          },
          reference: 'txtOutput',
          bind: {
            value: '{txtOutput}'
          },
        }
      ]
    }
  ]
});

// ---
// generated by coffee-script 1.9.2