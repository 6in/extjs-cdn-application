Ext.define('Pages.CaseFormatMakerViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.CaseFormatMaker',
    data: {
        title: 'なんとかケースさん',
        inputText: '',
    },
    stores: {
        mystore: {
            fields: 'org,type,Comment,SNAKE_CASE,snake_Case,CamelCase,camelCase,TRAIN-CASE,train-case,UPPERCASE,LOWERCASE,'.split(","),
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            }
        }
    }
});

Ext.define('Page.CaseFormatMakerController', {
    extend: 'Pages.BaseController',
    alias: 'controller.CaseFormatMaker',
    init() {
        const me = this
        me.callParent(arguments);
        me.delay(100, () => {
            me.getViewModel().setData({
                inputText: me.getConst('CaseFormatMaker').inputText
            })
        })
    },
    onConvertAnyCase: function () {
        var data, lines, me, rows, store, template, vm;
        me = this;
        vm = me.getViewModel();
        data = vm.getData();
        rows = [];
        lines = data.inputText.split(/\r?\n/).filter(line => line.trim() !== "")
            .map(function (line) {
                var cmnt, row;
                cmnt = "";
                line = line.replace(/(#|\/\/|--)(.+$)/g, function (g0, g1, g2) {
                    cmnt = g2.replace(/\s+/g, "");
                    return "";
                }).replace(/\s+/g, "").replace(/[,"']/g, "");
                row = Ext.create("AnyConvert", {
                    word: line,
                    cmnt: cmnt
                });
                return rows.push(row.getRow());
            });
        store = vm.getStore("mystore");
        store.loadData(rows);
        template = me.lookupReference("combo").getValue();
        if (template) {
            return me.onTemplateSelect(null, template);
        }
    },
    onTemplateSelect: function (obj, rec) {
        var me, result, store, tmpl, vm;
        me = this;
        vm = me.getViewModel();
        store = vm.getStore("mystore");
        tmpl = new Ext.Template(rec);
        result = [];
        store.each(function (rec) {
            if (rec.data.org) {
                return result.push(tmpl.apply(rec.data));
            } else {
                return result.push("");
            }
        });
        return vm.setData({
            outputResult: result.join("\n")
        });
    }

});

Ext.define('Pages.CaseFormatMaker', {
    extend: 'Ext.panel.Panel',

    controller: 'CaseFormatMaker',
    viewModel: 'CaseFormatMaker',

    bind: {
        title: '{title}'
    },

    layout: {
        type: 'border',
        regionWeights: {
            west: 20,
            north: 10,
            south: -10,
            east: -20
        }
    },
    items: [
        {
            region: 'west',
            title: '入力エリア',
            width: 600,
            split: true,
            tbar: [
                '->',
                {
                    text: '変換',
                    handler: 'onConvertAnyCase',
                    iconCls: 'fa fa-chevron-right',
                    iconAlign: 'right'
                },
            ],
            layout: 'fit',
            items: {
                xtype: 'monaco',
                bind: {
                    value: '{inputText}'
                }
            }
        },
        {
            region: 'center',
            title: '変換結果',
            xtype: 'grid',
            columnLines: true,
            columns: [
                {
                    xtype: 'rownumberer',
                    width: 60,
                    header: 'No.'
                }, {
                    header: 'Original',
                    dataIndex: 'org'
                }, {
                    header: 'Type',
                    dataIndex: 'type'
                }, {
                    header: 'Comment',
                    dataIndex: 'Comment'
                }, {
                    header: 'SNAKE_CASE',
                    dataIndex: 'SNAKE_CASE'
                }, {
                    header: 'snake_case',
                    dataIndex: 'snake_Case'
                }, {
                    header: 'CamelCase',
                    dataIndex: 'CamelCase'
                }, {
                    header: 'camelCase',
                    dataIndex: 'camelCase'
                }, {
                    header: 'TRAIN-CASE',
                    dataIndex: 'TRAIN-CASE'
                }, {
                    header: 'train-case',
                    dataIndex: 'train-case'
                }, {
                    header: 'UPPERCASE',
                    dataIndex: 'UPPERCASE'
                }, {
                    header: 'lowercase',
                    dataIndex: 'lowercase'
                }, {
                    header: 'RegExp',
                    dataIndex: 'regexp'
                }
            ],
            bind: '{mystore}',
            plugins: [
                {
                    ptype: 'clipboard'
                }
            ],
            selModel: {
                type: "spreadsheet",
                columnSelect: true
            }
        },
        {
            region: 'south',
            height: 300,
            title: '簡易テンプレート',
            split: true,
            layout: 'fit',
            tbar: [
                {
                    xtype: 'combo',
                    fieldLabel: 'テンプレート切替',
                    reference: 'combo',
                    store: {
                        fields: ['template'],
                        data: [
                            {
                                template: '{camelCase} = obj.get{CamelCase}(); // {Comment}'
                            }, {
                                template: 'obj.set{CamelCase}( {camelCase} ); // {Comment}'
                            }, {
                                template: 'obj.put( "{SNAKE_CASE}", {camelCase} ); // {Comment}'
                            }, {
                                template: 'obj["{TRAIN-CASE}"] = {camelCase} # {Comment}'
                            }, {
                                template: '{snake_case} AS "{SNAKE_CASE}", -- {Comment}'
                            }
                        ]
                    },
                    emptyText: '選択してください。変更もできます',
                    labelWidth: 130,
                    flex: 1,
                    queryMode: 'local',
                    valueField: 'template',
                    displayField: 'template',
                    value: '{camelCase} = obj.get{CamelCase}(); // {Comment}',
                    listeners: {
                        change: 'onTemplateSelect'
                    }
                }
            ],
            items: {
                xtype: 'monaco',
                bind: {
                    value: '{outputResult}'
                }
            }

        }
    ]
});