

Ext.define('Pages.TreeMakerViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TreeMaker',
    data: {
        title: 'Treeさん',
        counter: 1,
    },
    stores: {

    }
});

Ext.define('Page.TreeMakerController', {
    extend: 'Pages.BaseController',
    alias: 'controller.TreeMaker',
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
            Ext.create('Pages.TreeMaker.MainView', {
                title: `シート-${counter++}`,
                closable: true,
            })
        ));
        me.getViewModel().setData({
            counter
        });
    }
});

Ext.define('Pages.TreeMakerMainViewViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TreeMakerMainView',
    data: {
        inputText: '',
        outputText: '',
        treeType: 'normal',
    },
    stores: {
    }
});

Ext.define('Page.TreeMakerMainViewController', {
    extend: 'Pages.BaseController',
    alias: 'controller.TreeMakerMainView',
    static: {
        inputText: ''
    },
    init() {
        const me = this
        me.callParent(arguments)
        me.delay(100, () => {
            console.log(me.constYaml);
            me.getViewModel().setData({
                inputText: me.getConst('TreeMaker').inputText
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
        lines = data.inputText.split("\n");
        TreeUtil.currentSet = data.treeType;
        keisen = TreeUtil.keisenSet[TreeUtil.currentSet];
        buff = [];
        for (j = 0, len = lines.length; j < len; j++) {
            line = lines[j];
            if (line) {
                ref = TreeUtil.checkIndent(line), level = ref[0], text = ref[1];
                indent = TreeUtil.repeat(keisen.space, level * keisen.indent) + keisen.line;
                line = indent + text;
                buff.push([level, line.split("")]);
            }
        }
        length = buff.length;
        for (i = k = 0, len1 = buff.length; k < len1; i = ++k) {
            x = buff[i];
            level = x[0], line = x[1];
            index = level * keisen.indent;
            if (!i) {
                continue;
            }
            if (buff[i - 1][1][index] === keisen.space) {
                TreeUtil.lineFromToUp(buff, i, index);
            }
        }
        for (i = l = 0, len2 = buff.length; l < len2; i = ++l) {
            x = buff[i];
            level = x[0], line = x[1];
            index = level * keisen.indent;
            ch1 = buff[i][1][index];
            if (i < length - 1) {
                ch2 = buff[i + 1][1][index];
                if (ch2 !== keisen.cross && ch2 !== keisen.bar) {
                    buff[i][1][index] = keisen.stop;
                }
            }
        }
        last = buff[length - 1];
        index = last[1].indexOf(keisen.cross);
        last[1][index] = keisen.stop;
        lines = [];
        for (i = m = 0, len3 = buff.length; m < len3; i = ++m) {
            x = buff[i];
            indent = x[0], line = x[1];
            lines.push(line.join(""));
        }
        vm.setData({
            outputText: lines.join("\n")
        });
    }
});


Ext.define('Pages.TreeMaker.MainView', {
    extend: 'Ext.panel.Panel',

    controller: 'TreeMakerMainView',
    viewModel: 'TreeMakerMainView',

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
                    text: 'インデントでツリーの階層を編集してください。',
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
                    value: 'zenkaku',
                    items: [
                        {
                            text: '半角',
                            value: 'normal'
                        }, {
                            text: '全角',
                            value: 'zenkaku'
                        }, {
                            text: '全角(太字)',
                            value: 'zenkakub'
                        }
                    ],
                    listeners: {
                        change: 'onChangeInputText'
                    },
                    bind: {
                        value: '{treeType}'
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

Ext.define('Pages.TreeMaker', {
    extend: 'Ext.panel.Panel',

    controller: 'TreeMaker',
    viewModel: 'TreeMaker',

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