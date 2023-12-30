Ext.define('Pages.YamlJsonConverterViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.YamlJsonConverter',
  reference: 'viewmodel',
  data: {
    title: 'Yaml↔Json変換さん',
    inputText: 'key_name: value',
    outputText: '',
    tabSize: 2
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
    tabSize = data.tabSize;
    yaml = data.inputText;
    jsonData = jsyaml.load(yaml);
    return vm.setData({
      outputText: JSON.stringify(jsonData, null, tabSize)
    });
  },
  toYaml: function () {
    var jsonData, me, vm;
    me = this;
    vm = me.getViewModel();
    jsonData = JSON.parse(vm.getData().outputText);
    return vm.setData({
      inputText: jsyaml.dump(jsonData)
    });
  },
  toPretty: function () {
    var data, jsonData, me, tabSize, vm;
    me = this;
    vm = me.getViewModel();
    data = vm.getData();
    tabSize = data.tabSize;
    jsonData = JSON.parse(data.outputText);
    return vm.setData({
      outputText: JSON.stringify(jsonData, null, tabSize)
    });
  },
  toUgly: function () {
    var jsonData, me, vm;
    me = this;
    vm = me.getViewModel();
    jsonData = JSON.parse(vm.getData().outputText);
    return vm.setData({
      outputText: JSON.stringify(jsonData)
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
      inputText: data.inputText.split(/\n/g).map(function (line) {
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
      inputText: data.inputText.split(/\n/g).map(function (line) {
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
          itemId: 'txtInput',
          reference: 'txtInput',
          options: {
            language: 'yaml',
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
        }
      ],
      items: [
        {
          xtype: 'monaco',
          itemId: 'txtOutput',
          options: {
            language: 'json',
            minimap: {
              enabled: true
            }
          },
          reference: 'txtOutput',
          bind: {
            value: '{outputText}'
          }
        }
      ]
    }
  ]
});

// ---
// generated by coffee-script 1.9.2