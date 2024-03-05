Ext.define('Pages.SqlSwitcherViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.SqlSwitcher',
  reference: 'viewmodel',
  stores: {
    mystore: {
      fields: [
        {
          name: 'apply',
          type: 'bool'
        }, {
          name: 'ifstmt',
          type: 'string'
        }
      ],
      proxy: {
        type: 'memory',
        reader: {
          type: 'json'
        }
      }
    },
    paramStore: {
      fields: [
        {
          name: 'original',
          type: 'string'
        }, {
          name: 'replace',
          type: 'string'
        }
      ],
      proxy: {
        type: 'memory',
        reader: {
          type: 'json'
        }
      }
    }
  },
  data: {
    title: 'SQLSwitchさん',
    iconCls: 'fas fa-snowplow',
    txtInput: 'a = 1',
    txtOutput: '出力用テキストエリアにバインドされます',
    autoCopy: false,
    skipEmptyLine: true
  }
});

Ext.define('Pages.SqlSwitcherController', {
  extend: 'Pages.BaseController',
  alias: 'controller.SqlSwitcher',
  init: function () {
    var data, json, me, vm;
    me = this;
    me.callParent(arguments);
    vm = this.getViewModel();
    data = vm.getData();
    document.title = data.name;
    json = me.getConst('SqlSwitcher')
    vm.setData(json);

  },
  onChangeFilterText: function (text, keyword) {
    var data, filters, me, ref, store, vm;
    console.log({ keyword })
    ref = this.me(), me = ref.me, vm = ref.vm, data = ref.data;
    store = vm.getStore(text.storeName);
    filters = store.getFilters();
    filters.removeAll();
    if (!keyword) {
      console.log("return")
      return;
    }
    if (!/^\s*$/.test(keyword)) {
      return me.delay(100, function () {
        return filters.add(function (rec) {
          return text.cols.some(function (key) {
            const val = rec.data[key]
            console.log({ val })
            return ("" + val).indexOf(keyword) >= 0;
          });
        });
      });
    }
  },
  me: function () {
    return {
      me: this,
      vm: this.getViewModel(),
      data: this.getViewModel().getData()
    };
  },
  onAnalyze: function () {
    var conditionRows, data, ifStack, ifStmt, lhs, lineCondition, me, paramSet, ref, regIf, regParam, store, vm;
    ref = this.me(), me = ref.me, vm = ref.vm, data = ref.data;
    lhs = me.lookupReference('diff').getLhs();
    vm.setData({
      txtInput: lhs
    });
    regIf = /^\s*(\/\*(IF|ELIF|ELSE|END).+)$/;
    regParam = /\/\*\w+\*\/(\d+|'[^']+'|\([^\)]+\))/g;
    ifStmt = {};
    lineCondition = [];
    ifStack = [];
    paramSet = {};
    lhs.split(/\r?\n/).forEach(function (line) {
      var last, m, matches, matchesIt;
      m = line.match(regIf);
      if (m !== null) {
        if (m[2] === "IF") {
          ifStack.push(m[1]);
        }
        if (m[2] === "ELIF") {
          ifStack.pop();
          ifStack.push(m[1]);
        }
        if (m[2] === "ELSE") {
          last = ifStack.pop();
          ifStack.push("ELSE-" + last);
        }
        if (m[2] === "END") {
          last = ifStack.pop();
        }
      }
      lineCondition.push(ifStack.join("/"));
      matchesIt = line.matchAll(regParam);
      matches = [];

      // イテレータからデータを取得
      for (const m of matchesIt) {
        matches.push(m[0])
      }
      ;
      if (matches.length > 0) {
        return matches.forEach(function (m) {
          return paramSet[m] = '';
        });
      }
    });
    lineCondition.filter(function (lc) {
      return lc !== "";
    }).forEach(function (lc) {
      return ifStmt[lc] = "";
    });
    vm.setData({
      lineCondition: lineCondition
    });
    conditionRows = [];
    store = vm.getStore('mystore');
    store.loadData(Object.keys(ifStmt).map(function (stmt) {
      return {
        apply: false,
        ifstmt: stmt
      };
    }));
    store = vm.getStore('paramStore');
    store.loadData(Object.keys(paramSet).map(function (param) {
      return {
        original: param,
        replace: param
      };
    }));
    return me.delay(100, function () {
      return me.onClickCheck();
    });
  },
  onClickCheck: function (obj, idx, val, rec) {
    var data, me, ref, vm;
    ref = this.me(), me = ref.me, vm = ref.vm, data = ref.data;
    return me.delay(100, function () {
      var filters, i, line, lines, output, paramStore, ref1, regesc, stmt, store, text;
      store = vm.getStore('mystore');
      filters = [];
      store.each(function (rec) {
        if (rec.data.apply) {
          return filters.push(rec.data.ifstmt);
        }
      });
      text = data.txtInput;
      regesc = function (word) {
        word = word.replace(/\/\*/g, "\\/\\*");
        word = word.replace(/\*\//g, "\\*\\/");
        word = word.replace(/\(/g, "\\(");
        word = word.replace(/\)/g, "\\)");
        return new RegExp(word, "g");
      };
      paramStore = vm.getStore('paramStore');
      paramStore.each(function (rec) {
        var o, r;
        o = rec.data.original;
        r = rec.data.replace;
        if (o !== r) {
          return text = text.replace(regesc(o), r);
        }
      });
      output = [];
      lines = text.split(/\r?\n/);
      for (idx = i = 0, ref1 = lines.length - 1; 0 <= ref1 ? i <= ref1 : i >= ref1; idx = 0 <= ref1 ? ++i : --i) {
        line = lines[idx];
        stmt = data.lineCondition[idx];
        if (stmt === "") {
          output.push(line);
        } else if (indexOf.call(filters, stmt) >= 0) {
          output.push(line);
        } else {
          output.push("");
        }
      }
      if (data.skipEmptyLine) {
        output = output.filter(function (line) {
          return line.trim() !== "";
        });
      }
      vm.setData({
        txtOutput: output.join("\n")
      });
      if (data.autoCopy) {
        return me.onCopy();
      }
    });
  },
  onCopy: function () {
    var data, me, ref, vm;
    ref = this.me(), me = ref.me, vm = ref.vm, data = ref.data;
    return navigator.clipboard.writeText(data.txtOutput).then(function () {
      return Ext.toast('クリップボードにコピーしました', null, "br");
    });
  }
});

Ext.define('Pages.SqlSwitcher', {
  extend: 'Ext.panel.Panel',
  layout: 'border',
  controller: 'SqlSwitcher',
  viewModel: 'SqlSwitcher',
  bind: {
    title: '{title}',
    iconCls: '{iconCls}'
  },
  items: [
    {
      region: 'center',
      flex: 2,
      layout: 'fit',
      items: {
        xtype: 'tabpanel',
        reference: 'west_panel',
        tbar: [
          {
            text: '解析',
            handler: 'onAnalyze'
          }, '->', {
            xtype: 'checkbox',
            boxLabel: '空行をスキップ',
            bind: {
              value: '{skipEmptyLine}'
            },
            listeners: {
              change: 'onClickCheck'
            }
          }, {
            text: 'コピー',
            handler: 'onCopy'
          }, {
            xtype: 'checkbox',
            boxLabel: '自動コピー',
            bind: {
              value: '{autoCopy}'
            }
          }
        ],
        items: {
          title: '左側にSQLを貼り付けて、解析ボタンをクリックしてください',
          layout: 'fit',
          items: {
            xtype: 'monacodiff',
            reference: 'diff',
            tabSize: 4,
            language: 'sql',
            bind: {
              original: '{txtInput}',
              modified: '{txtOutput}'
            },
            options: {
              theme: 'vs-dark',
            }
          }
        }
      }
    }, {
      region: 'east',
      split: true,
      collapsible: true,
      title: '条件',
      flex: 1,
      layout: 'border',
      items: [
        {
          region: 'center',
          tbar: [
            {
              xtype: 'textfield',
              fieldLabel: 'フィルタ',
              labelWidth: 80,
              storeName: 'mystore',
              cols: ['ifstmt'],
              flex: 1,
              listeners: {
                change: 'onChangeFilterText'
              }
            }
          ],
          layout: 'fit',
          flex: 1,
          items: {
            xtype: 'grid',
            columnLines: true,
            plugins: [
              {
                ptype: 'cellediting',
                clicksToEdit: 1
              }, {
                ptype: 'clipboard'
              }
            ],
            selModel: {
              type: 'spreadsheet',
              columnSelect: true
            },
            columns: [
              {
                xtype: "rownumberer",
                width: 60,
                header: "No."
              }, {
                header: '適用',
                dataIndex: 'apply',
                xtype: 'checkcolumn',
                listeners: {
                  checkchange: 'onClickCheck'
                }
              }, {
                header: '条件テキスト',
                dataIndex: 'ifstmt',
                flex: 1
              }
            ],
            bind: '{mystore}'
          }
        }, {
          region: 'south',
          flex: 1,
          split: true,
          title: 'パラメータの置換',
          layout: 'fit',
          tbar: [
            {
              xtype: 'textfield',
              fieldLabel: 'フィルタ',
              storeName: 'paramStore',
              cols: ['original', 'replace'],
              labelWidth: 80,
              flex: 1,
              listeners: {
                change: 'onChangeFilterText'
              }
            }
          ],
          items: {
            xtype: 'grid',
            columnLines: true,
            plugins: [
              {
                ptype: 'cellediting',
                clicksToEdit: 1
              }, {
                ptype: 'clipboard'
              }
            ],
            selModel: {
              type: 'spreadsheet',
              columnSelect: true
            },
            columns: [
              {
                xtype: "rownumberer",
                width: 60,
                header: "No."
              }, {
                header: 'パラメータ',
                dataIndex: 'original',
                flex: 1,
                editor: {
                  xtype: 'textfield',
                  readOnly: true
                }
              }, {
                header: '置換テキスト',
                dataIndex: 'replace',
                flex: 1,
                editor: {
                  xtype: 'textfield',
                  listeners: {
                    blur: 'onClickCheck'
                  }
                }
              }
            ],
            bind: '{paramStore}'
          }
        }
      ]
    }
  ]
});