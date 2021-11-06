Ext.define('Pages.GenericTemplateViewModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.GenericTemplate',
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
    title: '汎用テンプレートさん',
    inputText: 'a = 1',
    outputText: '',
    txtSimple: '',
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

Ext.define('Pages.GenericTemplateController', {
  extend: 'Pages.BaseController',
  alias: 'controller.GenericTemplate',
  init: function() {
    var data, json, k, me, newData, ref, store, v, vm;
    me = this;
    me.callParent(arguments);
    vm = this.getViewModel();
    data = vm.getData();

    me.delay(100, () => {
      console.log("const=>",me.getConst('GenericTemplate'));
      me.getViewModel().setData(
          me.getConst('GenericTemplate')
      );
    });
  },
  onInitialView: function() {
    var SheetArea, data, e, me, sheet, spread, spreadNS, workbook;
    me = this;
  },
  parseData: function(type, text) {
    var lines, sep;
    sep = "";
    switch (type) {
      case "csv":
        sep = /,/;
        break;
      case "tsv":
        sep = /\s+/;
    }
    lines = text.split(/\r?\n/).filter(function(line) {
      return line.replace(/\s+/g, "") !== "";
    }).map(function(line) {
      return line.split(sep);
    });
    return lines;
  },
  getSheetData: function(ws) {
    var cols, head, headLen, isEmpty, l, m, maxCol, maxRow, ref, ref1, result, results, row;
    maxCol = ws.getColumnCount();
    maxRow = ws.getRowCount();
    head = ExcelUtil.getLine(ws, 0).filter(function(col) {
      return col.v !== "";
    }).map(function(col) {
      return col.v;
    });
    headLen = head.length;
    result = [head];
    for (row = l = 2, ref = maxRow; 2 <= ref ? l <= ref : l >= ref; row = 2 <= ref ? ++l : --l) {
      cols = ExcelUtil.getLine(ws, row - 1).map(function(col) {
        return col.v;
      });
      isEmpty = cols.filter(function(col) {
        return col === "";
      }).length === cols.length;
      if (!isEmpty) {
        if (cols.length !== headLen) {
          (function() {
            results = [];
            for (var m = 1, ref1 = headLen - cols.length; 1 <= ref1 ? m <= ref1 : m >= ref1; 1 <= ref1 ? m++ : m--){ results.push(m); }
            return results;
          }).apply(this).forEach(function(i) {
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
  onOut: function(obj) {
    var e, me;
    me = this;
    try {
      return me.onOutImpl(obj);
    } catch (_error) {
      e = _error;
      return console.log(e);
    }
  },
  onOutImpl: function(obj) {
    var addLineNo, allText, convJson, d, data, emptyIsNull, hasHeader, head, me, startRow, tab, tabs, template, tmplData, tmplObj, vm;
    me = this;
    vm = me.getViewModel();
    d = vm.getData();
    data = Object.assign([],d.rows)
    hasHeader = me.lookupReference("hasHeader").getValue();
    convJson = me.lookupReference("convJson").getValue();
    allText = me.lookupReference("allText").getValue();
    addLineNo = me.lookupReference("addLineNo").getValue();
    emptyIsNull = me.lookupReference("emptyIsNull").getValue();
    head = [];
    // startRow = 1;
    if (hasHeader) {
      head = data.shift();
      // startRow = 2;
    } else {
      head = data[0].map(function(v, i) {
        return "COL_" + (i + 1);
      });
    }
    tmplData = data.map(function(row, rowNum) {
      var newRow;
      newRow = {};
      head.map(function(col, i) {
        var ref, val;
        val = row[i];
        if (convJson) {
          if ((ref = val[0]) === "[" || ref === "{") {
            try {
              val = JSON.parse(val.replace(/""/g, "\""));
            } catch (e) {              
            }
          }
        }
        return newRow[col] = val;
      });
      if (addLineNo) {
        newRow["LINE_NO"] = rowNum
      }
      return newRow;
    });
    tabs = me.lookupReference("tabs");
    tab = tabs.getActiveTab().title;
    template = d["txt" + tab];
    tmplObj = Ext.create("Pages.components.TemplateUtils." + tab, {
      controller: me
    });
    return tmplObj.applyTemplate(template, {
      cols: head,
      rows: tmplData
    }).then(function(ok) {
      return vm.setData({
        outputText: ok.text
      });
    })["catch"](function(ng) {
      return vm.setData({
        outputText: ng.error || "何かのエラー"
      });
    });
  },
  onTabChange: function(obj, newTab) {
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

Ext.define('Pages.GenericTemplate', {
  extend: 'Ext.panel.Panel',
  layout: 'border',
  controller: 'GenericTemplate',
  viewModel: 'GenericTemplate',
  bind: {
    title: '{title}'
  },  
  tbar: [
    {
      xtype: 'checkbox',
      boxLabel: 'Headerあり',
      labelWidth: 80,
      reference: 'hasHeader',
      value: true
    }, {
      xtype: 'checkbox',
      boxLabel: 'セル内Jsonを変換',
      labelWidth: 80,
      reference: 'convJson',
      value: true
    }, {
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
              title: 'Simple',
              layout: 'fit',
              items: {
                xtype: 'monaco',
                itemId: 'txtSimple',
                reference: 'txtSimple',
                options: {
                  language: 'shell',
                  minimap: {
                      enabled: true
                  },
                  useSoftTab: false,
                  tabSize: 4,  
                },
                bind: {
                  value: '{txtSimple}'
                }
              }
            }, {
              title: 'Underscore',
              layout: 'fit',
              items: {
                xtype: 'monaco',
                itemId: 'txtUnderscore',
                reference: 'txtUnderscore',
                options: {
                  language: 'html',
                  minimap: {
                      enabled: true
                  },
                  useSoftTab: false,
                  tabSize: 4,  
                },
                bind: {
                  value: '{txtUnderscore}'
                }
              }
            }, {
              title: 'JavaScript',
              layout: 'fit',
              items: {
                xtype: 'monaco',
                itemId: 'txtJavaScript',
                reference: 'txtJavaScript',
                options: {
                  language: 'javascript',
                  minimap: {
                      enabled: true
                  },
                  useSoftTab: false,
                  tabSize: 4,  
                },
                bind: {
                  value: '{txtJavaScript}'
                }
              }
            }
          ],
          buttons: [
            {
              text: '生成',
              handler: 'onOut',
              reference: 'createButton',
              disabled: true
            }
          ],
          buttonAlign: 'left'
        }, {
          region: 'south',
          title: '出力',
          height: 300,
          layout: 'fit',
          split: true,
          reference: 'outputPain',
          collapsible: true,
          items: {
            xtype: 'monaco',
            itemId: 'txtOutput',
            reference: 'txtOutput',
            useSoftTab: false,
            tabSize: 4,
            bind: {
              value: '{outputText}'
            }
          }
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