Ext.define('Pages.TextPosViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TextPos',
    data: {
        title: '表示位置さん',
    },
    stores: {

    }
});

Ext.define('Page.TextPosController', {
    extend: 'Pages.BaseController',
    alias: 'controller.TextPos',
    init() {
        const me = this
        me.callParent(arguments);
        me.delay(100, () => {
            me.addDiffPanel();
        });
    },
    addDiffPanel() {
        const me = this;
        const tabs = me.lookupReference('tabs');

        const newTab = tabs.add(
            Ext.create('Pages.TextPos.DiffPanel', {
                title: 'テキスト',
                closable: true,
            })
        );
        tabs.setActiveTab(newTab);

    },
    setOriginalText() {
        const me = this;
        const tabs = me.lookupReference('tabs');
        const tab = tabs.getActiveTab();

        const dialog = Ext.create('Pages.TextPos.InputDialog', {
        });
        dialog.targetDiff = tab.down('#monacodiff');
        dialog.parentController = me;
        dialog.show();
    },
    onSetOriginalText(newText) {
        const me = this;
        const tabs = me.lookupReference('tabs');
        const tab = tabs.getActiveTab();
        const diff = tab.down('#monacodiff')
        diff.setOriginal(newText);
    }
});

//script:この行は消さないで下さい
function addPoint(text, errorPos, splitChar) {
    const splitCharLen = splitChar.length
    const lines = text.split(splitChar)
    // 各行の長さを取得
    const lineLengths = lines.map(l => l.length + splitCharLen)

    // 各行を加算しながら、errorPosがどの行に入っているかを判定
    const results = []
    let curLength = 0
    lineLengths.forEach((len, idx) => {
        results.push(lines[idx])
        if (curLength < errorPos && errorPos < (curLength + len)) {
            const loop = errorPos - curLength
            const pointer = []
            for (let i = 0; i < loop - 1; i++) {
                pointer.push("-")
            }
            pointer.push("^")
            results.push(pointer.join(""))
        }
        curLength += len
    })
    text = results.join("\n")
    return text
}

Ext.define('Pages.TextPos.DiffPanel', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    crlf: '\n',
    tbar: [
        {
            xtype: 'numberfield',
            labelWidth: 100,
            fieldLabel: 'テキスト位置',
            itemId: 'textPos',
            align: 'right',
            width: 200,
            value: 15,
        },
        {
            xtype: 'fieldcontainer',
            fieldLabel: '改行コード',
            labelWidth: 80,
            width: 200,
            items: [{
                xtype: 'segmentedbutton',
                itemId: 'crlf',
                allowToggle: true,
                items: [{
                    text: 'LF',
                    pressed: true
                }, {
                    text: 'CR/LF'
                }],
                listeners: {
                    toggle(container, button, pressed) {
                        const panel = this.up("panel")
                        if (pressed) {
                            panel.crlf = "\n"
                            if (button.text === "CR/LF") {
                                panel.crlf = "\r\n"
                            }
                        }
                    }
                }
            }]
        }
        ,
        {
            text: '検索',
            listeners: {
                click(obj) {
                    const panel = this.up("panel")
                    textPos = Number(panel.down("#textPos").value)
                    diff = panel.down("#monacodiff")
                    const orig = diff.editor.getOriginalEditor().getValue()
                    const added = addPoint(orig, textPos, panel.crlf)
                    diff.editor.getModifiedEditor().setValue(added)
                }
            }
        },
    ],
    items: [
        {
            xtype: 'monacodiff',
            itemId: 'monacodiff',
            original: '1234567890\n1234567890\n1234567890',
            modified: '1234567890\n1234567890\n---^\n1234567890',
            options: {
                theme: 'vs-dark',
            }
        }
    ]
    ,
});

Ext.define('Pages.TextPos', {
    extend: 'Ext.panel.Panel',

    controller: 'TextPos',
    viewModel: 'TextPos',

    bind: {
        title: '{title}'
    },

    tbar: [
        {
            text: 'Add',
            iconCls: 'fa fa-plus',
            handler: 'addDiffPanel'
        }
    ],
    layout: 'fit',
    items: {
        xtype: 'tabpanel',
        reference: 'tabs',
    }

});