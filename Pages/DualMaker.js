Ext.define('Pages.DualMakerViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.DualMaker',
    data: {
        title: 'Dualさん',
        counter: 1,
    },
    stores: {

    }
});

Ext.define('Pages.DualMakerController', {
    extend: 'Pages.BaseController',
    alias: 'controller.DualMaker',
    init() {
        const me = this
        me.callParent(arguments)

        me.delay(100, () => {
            me.onAddSheet();
        });
    },
    onAddSheet() {
        const me = this;
        const tabs = me.lookupReference('tabs');
        console.log(me.constYaml);

        let counter = me.getViewModel().getData().counter
        tabs.setActiveTab(tabs.add(
            Ext.create('Pages.DualMaker.MainView', {
                title: `シート-${counter++}`,
                closable: true,
            })
        ));
        tabs.getActiveTab().getViewModel().setData({
            rows: [
              ['A', 'B', 'C', 'D'],
              ['1', '2', '3', '4'],
              ['5', '6', '7', '8'],
            ]
        })      
        me.getViewModel().setData({
            counter
        });
    }
});

Ext.define('Pages.DualMakerMainViewViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.DualMakerMainView',
    data: {
        rows: [
            ['A', 'B', 'C', 'D'],
            ['1', 'ABC', '3', '4'],
            ['5', 'DEF', '7', 'null'],
        ],
        hasHeader: true,
        dualType: true,
        dbDualType: 'typeNormal',
        dualText: '',
        dbType: true,
        dblQuote: true,
        isAllString: false,
    },
    stores: {

    }
});

Ext.define('Pages.DualMakerMainViewController', {
    extend: 'Pages.BaseController',
    alias: 'controller.DualMakerMainView',
    init() {
        const me = this
        me.callParent(arguments)
    },
    onMakeDual() {
        const me = this;
        const vm = me.getViewModel();
        const d = me.getViewModel().getData();
        let head = [];
        let rows = [];
        // ヘッダー有無に対応
        if (d.hasHeader) {
            head = d.rows[0]
            rows = d.rows.slice(1);
        } else {
            head = d.rows[0].map(function (v, i) {
                return "COL_" + (i + 1);
            });
            rows = d.rows;
        }
        const dq = d.dblQuote ? '"' : '';

        // Dual表生成タイプから
        const newRows = rows.map((newRow, i) => {
            const cols = head.map((colName, j) => {
                const val = newRow[j];
                const isNull = val.toLowerCase() === 'null'

                if (isNull) {
                    return `null as ${dq}${colName}${dq}`
                }

                const ret = `'${val}' as ${dq}${colName}${dq}`;
                if (d.isAllString) {
                    return ret;
                }

                if (newRow[j].match(/\d+/)) {
                    return `${newRow[j]} as ${dq}${colName}${dq}`;
                } else {
                    return ret;
                }
            });

            let select = '          select ';
            if (i > 0) {
                select = 'union all select '
            }
            let from = ' '
            if (d.dbType === true) {
                from = ' from dual'
            }
            return select + cols.join(', ') + from;
        });

        // Dual表テキストを作成
        let sql = ''
        switch (d.dbDualType) {
            case 'typeNormal':
                sql = newRows.join('\n');
                break;
            case 'typeWith':
                sql += 'with sample as (\n';
                sql += newRows.map(row => "    " + row).join('\n');
                sql += "\n)\nselect\n    ";
                sql += head.map(h => `${dq}${h}${dq}`).join('\n,   ');
                sql += '\nfrom\n    sample\nwhere 1=1';
                break;
            case 'typeInsert':
                sql += "insert into XXXX (" + head.join(',') + ") \n";
                sql += 'with sample as (\n';
                sql += newRows.map(row => "    " + row).join('\n');
                sql += "\n)\nselect\n    ";
                sql += head.map(h => `${dq}${h}${dq}`).join('\n,   ');
                sql += '\nfrom\n    sample\nwhere 1=1';
                break;
            case 'typeCreate':
                const now = Ext.Date.format(new Date(), 'Ymd_His')
                sql += `create table tmp_${now} as \n`;
                sql += 'with sample as (\n';
                sql += newRows.map(row => "    " + row).join('\n');
                sql += "\n)\nselect\n    ";
                sql += head.map(h => `${dq}${h}${dq}`).join('\n,   ');
                sql += '\nfrom\n    sample\nwhere 1=1';
                break;
        }

        // エディタに反映
        return vm.setData({
            dualText: sql
        });

    },
    onChangeDualType() {
        this.delay(100, () => {
            this.onMakeDual();
        });
    },
});

Ext.define('Pages.DualMaker.MainView', {
    extend: 'Ext.panel.Panel',

    controller: 'DualMakerMainView',
    viewModel: 'DualMakerMainView',

    layout: 'border',
    items: [
        {
            region: 'west',
            width: '50%',
            title: 'シート',
            layout: 'fit',
            split: true,
            tbar: [
                {
                    xtype: 'checkbox',
                    boxLabel: 'ヘッダーあり',
                    bind: {
                        value: '{hasHeader}'
                    }
                },
                {
                    xtype: 'checkbox',
                    boxLabel: '全て文字列として判定',
                    bind: {
                        value: '{isAllString}'
                    }
                },
                '->',
                {
                    text: 'Dual表へ変換',
                    handler: 'onMakeDual',
                    iconCls: 'fa fa-chevron-right',
                    iconAlign: 'right'
                }
            ],
            items: {
                xtype: 'handson-table',
                bind: {
                    data: '{rows}'
                }
            }
        },
        {
            region: 'center',
            title: 'Dual表エリア',
            layout: 'fit',
            tbar: [
                {
                    xtype: 'checkbox',
                    boxLabel: 'Oracle',
                    bind: {
                        value: '{dbType}'
                    },
                    listeners: {
                        change: 'onChangeDualType'
                    },
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'カラムを"で囲む',
                    bind: {
                        value: '{dblQuote}'
                    },
                    listeners: {
                        change: 'onChangeDualType'
                    },
                },

                {
                    xtype: 'segmentedbutton',
                    defaultUI: "default-toolbar",
                    reference: 'createTypeCombo',
                    value: 'typeNormal',
                    items: [
                        {
                            text: 'ノーマル',
                            value: 'typeNormal'
                        },
                        {
                            text: 'With句',
                            value: 'typeWith'
                        },
                        {
                            text: 'Insert',
                            value: 'typeInsert'
                        },
                        {
                            text: 'Create Table',
                            value: 'typeCreate'
                        },
                    ],
                    listeners: {
                        change: 'onChangeDualType'
                    },
                    bind: {
                        value: '{dbDualType}'
                    }
                }
            ],
            items: {
                xtype: 'monaco',
                language: 'sql',
                bind: {
                    value: '{dualText}'
                }
            }
        }
    ]
});

Ext.define('Pages.DualMaker', {
    extend: 'Ext.panel.Panel',

    controller: 'DualMaker',
    viewModel: 'DualMaker',

    bind: {
        title: '{title}'
    },
    layout: 'fit',
    items: [
        {
            xtype: 'tabpanel',
            reference: 'tabs',
            tbar: [
                {
                    text: 'Add',
                    iconCls: 'fa fa-plus',
                    handler: 'onAddSheet'
                },
            ]
        },
    ]

});