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
          line = spc + key + val;
          line[0].toLowerCase() + line.slice(1);
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
    
    if (value) {
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
          jsonlMode: true,
          txtInput: 'key_name: value',
          txtOutput: ''
        })
        me.lookupReference("txtOutput").editor.updateOptions({wordWrap: "off"})
      })
    }
  }
});

Ext.define('Pages.YamlJsonConverter', {
  extend: 'Ext.panel.Panel',
  layout: 'border',
  controller: 'YamlJsonConverter',
  viewModel: 'YamlJsonConverter',

  bind: {
    title: '{title}'
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
          }
        }
      ]
    }
  ]
});

// ---
// generated by coffee-script 1.9.2