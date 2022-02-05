

Ext.define('Pages.KataKanaConvertViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.KataKanaConvert',
    data: {
        title: 'かたカナさん',
        counter: 1,
    },
    stores: {

    }
});

Ext.define('Page.KataKanaConvertController', {
    extend: 'Pages.BaseController',
    alias: 'controller.KataKanaConvert',
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

        let counter = me.getViewModel().getData().counter
        tabs.setActiveTab(tabs.add(
            Ext.create('Pages.KataKanaConvert.MainView', {
                title: `シート-${counter++}`,
                closable: true,
            })
        ));

        tabs.getActiveTab().getViewModel().setData({
            inputText: '',
            outputText: '',
            convType: 'toHankaku',
          });

        me.getViewModel().setData({
            counter
        });
    }
});

Ext.define('Pages.KataKanaConvertMainViewViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.KataKanaConvertMainView',
    data: {
        inputText: '',
        outputText: '',
        convType: 'toHankaku',
    },
    stores: {
    }
});

Ext.define('Page.KataKanaConvertMainViewController', {
    extend: 'Pages.BaseController',
    alias: 'controller.KataKanaConvertMainView',
    static: {
        inputText: ''
    },
    init() {
        const me = this
        me.callParent(arguments)
        me.delay(100, () => {
            me.getViewModel().setData({
                inputText: me.getConst('KataKanaConvert').inputText
            });
        });
    },
    onChangeInputText() {
        const me = this;
        me.delay(100, () => {
            me.onChangeInputTextImpl();
        });
    },
    onChangeInputTextImpl() {
        const me = this;
        const vm = me.getViewModel();
        const d = me.getViewModel().getData();

        data = vm.getData();
        lines = data.inputText;
        switch(data.convType) {
        case "toHankaku":
            lines = TranslateUtil.toHankaku(lines)
            break;
        case "toZenkaku":
            lines = TranslateUtil.toZenkaku(lines)
            break;
        case "zenHiragana":
            lines = TranslateUtil.kanaToHira(lines)
            break;
        case "zenKatakana":
            lines = TranslateUtil.hiraToKana(lines)
            break;
        }

        vm.setData({
            outputText: lines
        });
    },
});


Ext.define('Pages.KataKanaConvert.MainView', {
    extend: 'Ext.panel.Panel',

    controller: 'KataKanaConvertMainView',
    viewModel: 'KataKanaConvertMainView',

    layout: 'border',
    items: [
        {
            region: 'west',
            width: "50%",
            title: '入力データ',
            layout: 'fit',
            split: true,
            tbar: [
                {
                    xtype: 'label',
                    text: '変換元のテキストを入力してください',
                    flex: 1,
                }, {
                    // 隣のペインとのツールバーとの高さ合わせのため
                    xtype: 'segmentedbutton',
                    width: 0,
                    // hidden: true,
                    items: [
                        {
                            text: '',
                        },
                    ]
                }
            ],
            items: {
                xtype: 'monaco',
                bind: {
                    value: '{inputText}'
                },
                listeners: {
                    change: 'onChangeInputText'
                },
                tabSize: 2
            }
        },
        {
            region: 'center',
            title: '出力エリア',
            layout: 'fit',
            tbar: [
                {
                    xtype: 'segmentedbutton',
                    defaultUI: "default-toolbar",
                    // value: 'toHankaku',
                    items: [
                        {
                            text: '半角',
                            value: 'toHankaku'
                        }, {
                            text: '全角',
                            value: 'toZenkaku'
                        }, {
                            text: '全角ひらがな',
                            value: 'zenHiragana'
                        }, {
                            text: '全角カタカナ',
                            value: 'zenKatakana'
                        }
                    ],
                    listeners: {
                        change: 'onChangeInputText'
                    },
                    bind: {
                        value: '{convType}'
                    }
                }
            ],
            items: {
                xtype: 'monaco',
                tabSize: 2,
                bind: {
                    value: '{outputText}'
                }
            }
        }
    ]
});

Ext.define('Pages.KataKanaConvert', {
    extend: 'Ext.panel.Panel',

    controller: 'KataKanaConvert',
    viewModel: 'KataKanaConvert',

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