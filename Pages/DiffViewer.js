Ext.define('Pages.DiffViewerViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.DiffViewer',
    data: {
        title: 'Diffさん',
    },
    stores: {

    }
});

Ext.define('Page.DiffViewerController', {
    extend: 'Pages.BaseController',
    alias: 'controller.DiffViewer',
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
            Ext.create('Pages.DiffViewer.DiffPanel', {
                title: 'Diff',
                closable: true,
            })
        );
        tabs.setActiveTab(newTab);

    },
    setOriginalText() {
        const me = this;
        const tabs = me.lookupReference('tabs');
        const tab = tabs.getActiveTab();

        const dialog = Ext.create('Pages.DiffViewer.InputDialog', {
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

Ext.define('Pages.DiffViewer.InputDialog', {
    extend: 'Ext.Window',
    title: 'オリジナルテキストの入力',
    layout: 'fit',
    modal: true,
    width: 800,
    height: 600,
    itemId: 'inputDialog',
    items: {
        xtype: 'monaco',
        itemId: 'original',
    },
    buttons: [
        {
            text: 'OK',
            handler() {
                const me = this;
                me.ok = true;
                const dialog = me.up('#inputDialog');
                me.originalText = dialog.down('#original').getValue();
                dialog.close();
                // me.targetDiff.setOriginal(me.originalText);
                dialog.parentController.onSetOriginalText(me.originalText);
            }
        },
        {
            text: 'Cancel',
            handler() {
                const me = this;
                me.ok = false;
                me.up('#inputDialog').close();
            }
        }
    ]
});

Ext.define('Pages.DiffViewer.DiffPanel', {
    extend: 'Ext.panel.Panel',
    tbar: [
        {
            text: 'オリジナルテキストの入力',
            handler: 'setOriginalText'
        }, {
            xtype: 'label',
            text: '左側(オリジナル)は編集不可となっているので、ボタンをクリックして、左側のテキストを入力して下さい。'
        }
    ],
    layout: 'fit',
    items: [
        {
            xtype: 'monacodiff',
            itemId: 'monacodiff',
            original: '',
            modified: '',
            options: {
                theme: 'vs-dark',
            }
        }
    ]
    ,
});

Ext.define('Pages.DiffViewer', {
    extend: 'Ext.panel.Panel',

    controller: 'DiffViewer',
    viewModel: 'DiffViewer',

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