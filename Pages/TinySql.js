Ext.define('Pages.TinySqlViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.TinySql',
  reference: 'viewmodel',
  stores: {
    templates: {
      fields: 'TYPE,NAME,TEXT'.split(","),
      proxy: {
        type: 'localstorage',
        id: 'my-templates',
        reader: {
          type: 'json'
        }
      }
    }
  },
  data: {
    title: '簡易DBさん',
    inputText: 'a = 1',
    outputText: '',
    txtSql: '',
    txtUnderscore: '',
    txtJavascript: '',
    hasHeader: 1,
    rows: [
      ['COL_1', 'COL_2', 'COL_3', 'COL_4'],
      ['1', '2', '3', '4'],
      ['5', '6', '7', '8'],
    ],
    readme: ''
  }
});

Ext.define('Pages.TinySqlController', {
  extend: 'Pages.BaseController',
  alias: 'controller.TinySql',
  init: function () {
    var data, json, k, me, newData, ref, store, v, vm;
    me = this;
    me.callParent(arguments);
    vm = this.getViewModel();
    data = vm.getData();

    me.delay(100, () => {
      console.log("const=>", me.getConst('TinySql'));
      me.getViewModel().setData(
        me.getConst('TinySql')
      );
    });
  },
  onInitialView: function () {
    var SheetArea, data, e, me, sheet, spread, spreadNS, workbook;
    me = this;
  },
  parseData: function (type, text) {
    var lines, sep;
    sep = "";
    switch (type) {
      case "csv":
        sep = /,/;
        break;
      case "tsv":
        sep = /\s+/;
    }
    lines = text.split(/\r?\n/).filter(function (line) {
      return line.replace(/\s+/g, "") !== "";
    }).map(function (line) {
      return line.split(sep);
    });
    return lines;
  },
  getSheetData: function (ws) {
    var cols, head, headLen, isEmpty, l, m, maxCol, maxRow, ref, ref1, result, results, row;
    maxCol = ws.getColumnCount();
    maxRow = ws.getRowCount();
    head = ExcelUtil.getLine(ws, 0).filter(function (col) {
      return col.v !== "";
    }).map(function (col) {
      return col.v;
    });
    headLen = head.length;
    result = [head];
    for (row = l = 2, ref = maxRow; 2 <= ref ? l <= ref : l >= ref; row = 2 <= ref ? ++l : --l) {
      cols = ExcelUtil.getLine(ws, row - 1).map(function (col) {
        return col.v;
      });
      isEmpty = cols.filter(function (col) {
        return col === "";
      }).length === cols.length;
      if (!isEmpty) {
        if (cols.length !== headLen) {
          (function () {
            results = [];
            for (var m = 1, ref1 = headLen - cols.length; 1 <= ref1 ? m <= ref1 : m >= ref1; 1 <= ref1 ? m++ : m--) { results.push(m); }
            return results;
          }).apply(this).forEach(function (i) {
            return cols.push("");
          });
        }
        result.push(cols.slice(0, +(headLen - 1) + 1 || 9e9));
      } else {
        break;
      }
    }
    return result;
  },
  onOut: function (obj) {
    var e, me;
    me = this;
    try {
      return me.onOutImpl(obj);
    } catch (_error) {
      e = _error;
      return console.log(e);
    }
  },
  onOutImpl: function (obj) {
    const me = this
    const vm = me.getViewModel()
    const data = vm.getData()
    const tabs = me.lookupReference('tabpanel')

    try {
      // テーブル情報を解析
      tables = me.getTables(data.rows)

      results = window.sqlitedb.exec(data.txtSql)
      console.log(JSON.stringify(results, null, 2))
      while (tabs.items.items.length != 1) {
        tabs.remove(1)
      }

      results.forEach((result, index) => {
        const rowData = [result.columns].concat(result.values)
        const tab = tabs.add({
          title: `result${index + 1}`,
          closable: true,
          layout: 'fit',
          items: {
            xtype: 'handson-table',
            data: rowData
          }
        })
        tabs.setActiveTab(tab)
      })

    } catch (e) {
      Ext.Msg.alert('エラー', e, Ext.emptyFn);
    }
  },
  getTables: (rows) => {
    const tables = []
    let table = {
      state: '',
      name: '',
      cols: [],
      rows: []
    }
    let lastLineIsEmpty = true
    rows.forEach((row, i) => {
      console.log(JSON.stringify(row, null, 2))
      const isEmptyLine = row.reduce((a, b) => {
        if (a === null) {
          a = ''
        }
        if (b === null) {
          b = ''
        }
        return `${a}${b}`
      }).trim() === ''
      if (isEmptyLine) {
        lastLineIsEmpty = isEmptyLine
        return
      }
      if (row[1] === '' && lastLineIsEmpty) {
        table = {}
        table.state = 'table captured'
        table.name = row[0]
        table.cols = []
        table.rows = []
        lastLineIsEmpty = false
        tables.push(table)
        return
      }
      if (table.state === 'table captured') {
        table.state = 'column captured'
        table.cols = row.filter(col => col)
        lastLineIsEmpty = false
        return
      }
      if (table.state === 'column captured') {
        table.rows.push(row.slice(0, table.cols.length))
        lastLineIsEmpty = false
        return
      }
    })

    tables.forEach(table => {
      const colList = table.cols.filter(col => col).join(",")
      const valList = table.cols.filter(col => col).map(s => "?").join(",")
      table.initSql = [
        `drop table if exists ${table.name};`,
        `create table ${table.name} (${colList});`,
        `insert into ${table.name}(${colList}) values(${valList})`
      ]
      window.sqlitedb.exec(table.initSql[0])
      window.sqlitedb.exec(table.initSql[1])
      table.rows.forEach(row => {
        window.sqlitedb.run(table.initSql[2], row)
      })
    })

    return tables
  },
  onTabChange: function (obj, newTab) {
    var height, outputPain, title, createButton;
    title = newTab.title;
    outputPain = this.lookupReference("outputPain");
    createButton = this.lookupReference("createButton");
    if (!outputPain.saveHeight) {
      outputPain.saveHeight = outputPain.getHeight();
    }
    if (title === "README") {
      outputPain.saveHeight = outputPain.getHeight();
      createButton.setDisabled(true);
      outputPain.setHeight(50);
    } else {
      height = outputPain.saveHeight === 50 ? 400 : outputPain.saveHeight;
      createButton.setDisabled(false);
      return outputPain.setHeight(height);
    }
  },
});

Ext.define('Pages.TinySql', {
  extend: 'Ext.panel.Panel',
  layout: 'border',
  controller: 'TinySql',
  viewModel: 'TinySql',
  bind: {
    title: '{title}'
  },
  tbar: [
    {
      xtype: 'checkbox',
      boxLabel: 'すべて文字列とする',
      labelWidth: 130,
      reference: 'allText',
      value: true,
      visible: false
    }, {
      xtype: 'checkbox',
      boxLabel: '行番号を付与',
      labelWidth: 130,
      reference: 'addLineNo',
      value: true,
      // disabled: true
    }, {
      xtype: 'checkbox',
      boxLabel: '空白をNULLにする',
      labelWidth: 130,
      reference: 'emptyIsNull',
      value: true,
      visble: false
    }
  ],
  items: [
    {
      region: 'west',
      title: 'データを貼り付けて、生成ボタンをクリックして下さい',
      width: 400,
      split: true,
      layout: 'fit',
      items: [
        {
          xtype: 'handson-table',
          itemId: 'spread',
          reference: 'spread',
          bind: {
            data: '{rows}'
          }
        }
      ]
    }, {
      region: 'center',
      layout: 'border',
      reference: 'outputPain',
      items: [
        {
          region: 'center',
          xtype: 'tabpanel',
          split: true,
          reference: 'tabs',
          listeners: {
            tabchange: 'onTabChange'
          },
          items: [
            {
              title: 'README',
              layout: 'fit',
              items: {
                xtype: 'markdown',
                bind: {
                  value: '{readme}'
                }
              }
            }, {
              title: 'SQL',
              layout: 'fit',
              items: {
                xtype: 'monaco',
                itemId: 'txtSimple',
                reference: 'txtSimple',
                options: {
                  language: 'sql',
                  minimap: {
                    enabled: true
                  },
                  useSoftTab: false,
                  tabSize: 4,
                },
                bind: {
                  value: '{txtSql}'
                }
              }
            }
          ],
          buttons: [
            {
              text: '実行',
              handler: 'onOut',
              reference: 'createButton',
              disabled: true
            }
          ],
          buttonAlign: 'left'
        }, {
          region: 'south',

          height: 300,
          layout: 'fit',
          split: true,
          reference: 'tabpanel',
          collapsible: true,
          xtype: 'tabpanel',
          items: [{
            xtype: 'monaco',
            title: '出力',
            itemId: 'txtOutput',
            reference: 'txtOutput',
            useSoftTab: false,
            tabSize: 4,
            bind: {
              value: '{outputText}'
            }
          }]
        }
      ]
    }
  ],
  listeners: {
    afterrender: 'onInitialView'
  }
});

// ---
// generated by coffee-script 1.9.2