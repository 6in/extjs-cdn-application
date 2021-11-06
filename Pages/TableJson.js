Ext.define("KeisenUtil.Json", {
  extend: "KeisenUtil.Base",
  dataToText: function (data) {
    var alignRight, cols, e, me, result, ret, rows;
    me = this;
    ret = {
      text: "",
      error: "",
    };
    cols = data.cols;
    rows = data.rows;
    try {
      ret.text = JSON.stringify(data, null, 2);
    } catch (_error) {
      e = _error;
      console.log(e);
      ret.error = e.toString();
    }
    return ret;
  },
  textToData: function (text) {
    var ret;
    ret = {
      rows: [],
    };
    try {
      const data = JSON.parse(text);
      ret.rows = [data.cols].concat(data.rows);
    } catch (e) {
      console.log(e.message);
    }
    return ret.rows;
  },
});

Ext.define("KeisenUtil.Json2", {
  extend: "KeisenUtil.Base",
  dataToText: function (data) {
    var alignRight, cols, e, me, result, ret, rows;
    me = this;
    ret = {
      text: "",
      error: "",
    };
    cols = data.cols;
    rows = data.rows;
    try {
      rows = rows.map((row) => {
        const newRow = {};
        row.forEach((col, idx) => {
          newRow[cols[idx]] = col;
        });
        return newRow;
      });
      ret.text = JSON.stringify(rows, null, 2);
    } catch (_error) {
      e = _error;
      console.log(e);
      ret.error = e.toString();
    }
    return ret;
  },
  textToData: function (text) {
    var ret;
    ret = {
      rows: [],
    };
    try {
      const data = JSON.parse(text);
      const cols = Object.keys(data[0]);
      const rows = data.map((row) => {
        return cols.map((col) => {
          return row[col];
        });
      });
      ret.rows = [cols].concat(rows);
    } catch (e) {
      console.log(e.message);
    }
    return ret.rows;
  },
});

Ext.define("KeisenUtil.Yaml", {
  extend: "KeisenUtil.Base",
  dataToText: function (data) {
    var alignRight, cols, e, me, result, ret, rows;
    me = this;
    ret = {
      text: "",
      error: "",
    };
    cols = data.cols;
    rows = data.rows;
    try {
      rows = rows.map((row) => {
        const newRow = {};
        row.forEach((col, idx) => {
          newRow[cols[idx]] = col;
        });
        return newRow;
      });
      ret.text = jsyaml.dump({rows});
    } catch (_error) {
      e = _error;
      console.log(e);
      ret.error = e.toString();
    }
    return ret;
  },
  textToData: function (text) {
    var ret;
    ret = {
      rows: [],
    };
    try {
      const data = jsyaml.load(text);
      const cols = Object.keys(data[0]);
      const rows = data.map((row) => {
        return cols.map((col) => {
          return row[col];
        });
      });
      ret.rows = [cols].concat(rows);
    } catch (e) {
      console.log(e.message);
    }
    return ret.rows;
  },
});

Ext.define("KeisenUtil.Csv", {
  extend: "KeisenUtil.Base",
  config: {
    spliter: ','
  },
  dataToText: function (data) {
    var alignRight, cols, e, me, result, ret, rows;
    me = this;
    ret = {
      text: "",
      error: "",
    };
    cols = data.cols;
    rows = data.rows;
    result = [];
    try {
      const spliter = me.getSpliter()
      result.push(cols.join(spliter));
      rows.forEach((row) => {
        result.push(row.join(spliter));
      });
      ret.text = result.join("\n");
    } catch (_error) {
      e = _error;
      console.log(e);
      ret.error = e.toString();
    }
    return ret;
  },
  textToData: function (text) {
    const me = this
    var ret;
    ret = {
      rows: [],
    };
    try {
      const spliter = new RegExp(me.getSpliter())
      ret.rows = text.split(/\r?\n/)
      .filter(row => row !== "")
      .map(row => {
        return row.split(spliter)
      })
    } catch (e) {
      console.log(e.message);
    }
    return ret.rows;
  },
});

Ext.define("KeisenUtil.Tsv", {
  extend: "KeisenUtil.Csv",
  config: {
    spliter: '\t'
  },
});

Ext.define("Pages.TableJsonViewModel", {
  extend: "Ext.app.ViewModel",
  alias: "viewmodel.TableJson",
  data: {
    title: "表⇔Json変換さん",
    counter: 1,
  },
  stores: {},
});

Ext.define("Page.TableJsonController", {
  extend: "Pages.BaseController",
  alias: "controller.TableJson",
  init() {
    const me = this;
    me.callParent(arguments);

    me.delay(100, () => {
      me.onAddSheet();
    });
  },
  onAddSheet() {
    const me = this;
    const tabs = me.lookupReference("tabs");
    console.log(me.constYaml);

    let counter = me.getViewModel().getData().counter;
    tabs.setActiveTab(
      tabs.add(
        Ext.create("Pages.TableJson.MainView", {
          title: `シート-${counter++}`,
          closable: true,
        })
      )
    );
    me.getViewModel().setData({
      counter,
    });
  },
});

Ext.define("Pages.TableJsonMainViewViewModel", {
  extend: "Ext.app.ViewModel",
  alias: "viewmodel.TableJsonMainView",
  data: {
    rows: [
      ["A", "B", "C", "D"],
      ["1", "2", "3", "4"],
      ["5", "6", "7", "8"],
    ],
    hasHeader: true,
    tableType: "Json",
    languages: {
      "Json": "json",
      "Json2": "json",
      "Yaml": "yaml",
      "Csv": "csv",
      "Tsv": "tsv"
    },
    tableText: "",
  },
  stores: {},
});

Ext.define("Page.TableJsonMainViewController", {
  extend: "Pages.BaseController",
  alias: "controller.TableJsonMainView",
  init() {
    const me = this;
    me.callParent(arguments);
  },
  onMakeTable() {
    const me = this;
    const vm = me.getViewModel();
    const d = me.getViewModel().getData();
    let head = [];
    let rows = [];
    // ヘッダー有無に対応
    if (d.hasHeader) {
      head = d.rows[0];
      rows = d.rows.slice(1);
    } else {
      head = d.rows[0].map(function (v, i) {
        return "COL_" + (i + 1);
      });
      rows = d.rows;
    }
    // 罫線生成タイプから、生成用クラスの作成
    keisenObj = Ext.create("KeisenUtil." + d.tableType, {
      controller: me,
    });

    rows = rows.map((row) => {
      return row.map((col) => {
        col = `${col}`;
        if (col.match(/^[+\-]?\d+(\.\d+)?$/)) {
          col = Number(col);
        }
        return col;
      });
    });

    // 罫線テキストを作成
    ret = keisenObj.dataToText({
      cols: head,
      rows: rows,
    });

    const editor = me.lookupReference('editor')
    editor.changeLanguage(d.languages[d.tableType])

    // エディタに反映
    return vm.setData({
      tableText: ret.text,
    });
  },
  onChangeCreateTypeCombo() {
    const me = this;
    me.delay(100, () => {
      me.onMakeTable();
    });
  },
  onMakeSheet() {
    const me = this;
    const vm = me.getViewModel();
    const d = vm.getData();
    me.getView().mask("変換中");
    me.delay(100, () => {
      try {
        const { tableText } = d;
        keisenObj = Ext.create("KeisenUtil." + d.tableType, {
          controller: me,
        });
        rows = keisenObj.textToData(tableText);
        rows = rows.filter((row) => row.length > 0);
        vm.setData({ rows });
      } catch (e) {
        console.log(e);
      } finally {
        me.getView().unmask();
      }
    });
  },
});

Ext.define("Pages.TableJson.MainView", {
  extend: "Ext.panel.Panel",

  controller: "TableJsonMainView",
  viewModel: "TableJsonMainView",

  layout: "border",
  items: [
    {
      region: "west",
      width: "50%",
      title: "シート",
      layout: "fit",
      split: true,
      tbar: [
        {
          xtype: "checkbox",
          boxLabel: "ヘッダーあり",
          bind: {
            value: "{hasHeader}",
          },
        },
        "->",
        {
          text: "罫線へ変換",
          handler: "onMakeTable",
          iconCls: "fa fa-chevron-right",
          iconAlign: "right",
        },
      ],
      items: {
        xtype: "handson-table",
        bind: {
          data: "{rows}",
        },
      },
    },
    {
      region: "center",
      title: "テキストエリア",
      layout: "fit",
      tbar: [
        {
          text: "表へ変換",
          handler: "onMakeSheet",
          iconCls: "fa fa-chevron-left",
        },
        {
          xtype: "segmentedbutton",
          defaultUI: "default-toolbar",
          reference: "createTypeCombo",
          value: "Json",
          items: [
            {
              text: "Json[]",
              value: "Json",
            },
            {
              text: "Json{}",
              value: "Json2",
            },
            {
              text: "Yaml",
              value: "Yaml",
            },
            {
              text: "Csv",
              value: "Csv",
            },
            {
              text: "Tsv",
              value: "Tsv",
            },
          ],
          listeners: {
            change: "onChangeCreateTypeCombo",
          },
          bind: {
            value: "{tableType}",
          },
        },
      ],
      items: {
        xtype: "monaco",
        reference: 'editor',
        tabSize: 4,
        options: {
          insertSpaces: false
        },
        bind: {
          value: "{tableText}",
        },
      },
    },
  ],
});

Ext.define("Pages.TableJson", {
  extend: "Ext.panel.Panel",

  controller: "TableJson",
  viewModel: "TableJson",

  bind: {
    title: "{title}",
  },
  layout: "fit",
  items: [
    {
      xtype: "tabpanel",
      reference: "tabs",
      tbar: [
        {
          text: "Add",
          iconCls: "fa fa-plus",
          handler: "onAddSheet",
        },
      ],
    },
  ],
});
