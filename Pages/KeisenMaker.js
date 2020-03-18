

Ext.define('Pages.KeisenMakerViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.KeisenMaker',
    data: {
        title: '罫線さん',
        counter: 1,
    },
    stores: {

    }
});

Ext.define('Page.KeisenMakerController', {
    extend: 'Pages.BaseController',
    alias: 'controller.KeisenMaker',
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
            Ext.create('Pages.KeisenMaker.MainView', {
                title: `シート-${counter++}`,
                closable: true,
            })
        ));
        me.getViewModel().setData({
            counter
        });
    }
});

Ext.define('Pages.KeisenMakerMainViewViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.KeisenMakerMainView',
    data: {
        rows: [
            ['A', 'B', 'C', 'D'],
            ['1', '2', '3', '4'],
            ['5', '6', '7', '8'],
        ],
        hasHeader: true,
        keisenType: 'Keisen',
        keisenText: '',
    },
    stores: {

    }
});

Ext.define('Page.KeisenMakerMainViewController', {
    extend: 'Pages.BaseController',
    alias: 'controller.KeisenMakerMainView',
    init() {
        const me = this
        me.callParent(arguments)
    },
    onMakeKeisen() {
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
        // 罫線生成タイプから、生成用クラスの作成
        keisenObj = Ext.create("KeisenUtil." + d.keisenType, {
            controller: me
        });

        // 罫線テキストを作成
        ret = keisenObj.dataToText({
            cols: head,
            rows: rows,
        });

        // エディタに反映
        return vm.setData({
            keisenText: ret.text
        });

    },
    onChangeCreateTypeCombo() {
        this.delay(100, () => {
            this.onMakeKeisen();
        });
    },
    onMakeSheet() {
        const me = this;
        const vm = me.getViewModel();
        const d = vm.getData();
        me.delay(100, () => {
            try {
                me.getView().mask('変換中');
                const { keisenText } = d;
                keisenObj = Ext.create("KeisenUtil." + d.keisenType, {
                    controller: me
                });
                rows = keisenObj.textToData(keisenText);
                rows = rows.filter(row => row.length > 0);
                vm.setData({ rows });
            } catch (e) {
                console.log(e);
            } finally {
                me.getView().unmask();
            }
        });
    }

});


Ext.define('Pages.KeisenMaker.MainView', {
    extend: 'Ext.panel.Panel',

    controller: 'KeisenMakerMainView',
    viewModel: 'KeisenMakerMainView',

    layout: 'border',
    items: [
        {
            region: 'west',
            width: 600,
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
                }, '->',
                {
                    text: '罫線へ変換',
                    handler: 'onMakeKeisen',
                    iconCls: 'fa fa-chevron-right'
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
            title: '罫線エリア',
            layout: 'fit',
            tbar: [
                {
                    text: '表へ変換',
                    handler: 'onMakeSheet',
                    iconCls: 'fa fa-chevron-left'
                },
                {
                    xtype: 'segmentedbutton',
                    defaultUI: "default-toolbar",
                    reference: 'createTypeCombo',
                    value: 'Keisen',
                    items: [
                        {
                            text: '罫線',
                            value: 'Keisen'
                        }, {
                            text: 'Gitlab',
                            value: 'Gitlab'
                        }, {
                            text: 'Redmine',
                            value: 'Redmine'
                        }
                    ],
                    listeners: {
                        change: 'onChangeCreateTypeCombo'
                    },
                    bind: {
                        value: '{keisenType}'
                    }
                }
            ],
            items: {
                xtype: 'monaco',
                bind: {
                    value: '{keisenText}'
                }
            }
        }
    ]
});

Ext.define('Pages.KeisenMaker', {
    extend: 'Ext.panel.Panel',

    controller: 'KeisenMaker',
    viewModel: 'KeisenMaker',

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