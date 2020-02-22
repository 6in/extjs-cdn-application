Ext.define('Pages.SampleViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.Sample',
    data: {
        text: 'sample',
        original: 'This line is removed on the right.\njust some text\nabcd\nefgh\nSome more text',
        modified: 'just some text\nabcz\nzzzzefgh\nSome more text.\nThis line is removed on the left.'
    },
    stores: {
        sampleStore: {
            fields: [
                { name: 'name', type: 'string' },
                { name: 'age', type: 'int' }
            ],
            data: [
                { name: 'HTML', age: 29 },
                { name: 'javascript', age: 23 },
                { name: 'C', age: 46 }
            ]
        }
    }
});

Ext.define('Page.SampleController', {
    extend: 'Pages.BaseController',
    alias: 'controller.Sample',
    init() {
        const me = this
        me.callParent(arguments)
    },
    onClickOk() {
        const me = this
        const text = me.getViewModel().getData().text;
        const diff = me.lookupReference('diff')
        diff.setOriginal(text);
    }
});

Ext.define('Pages.Sample', {
    extend: 'Ext.panel.Panel',

    controller: 'Sample',
    viewModel: 'Sample',

    title: 'Sample-Panel',
    alias: 'widget.sample',
    iconCls: 'fa fa-cat',

    layout: 'border',

    items: [{
        region: 'north',
        split: true,
        height: 300,
        layout: 'fit',
        items: {
            xtype: 'monaco',
            options: {
                language: 'javascript',
                minimap: {
                    enabled: true
                }
            },
            bind: {
                value: '{text}',
            },
        },
        buttons: [{
            text: 'OK',
            handler: 'onClickOk'
        }]
    }, {
        region: 'center',
        reference: 'diff',
        xtype: 'monacodiff',
        bind: {
            original: '{original}',
            modified: '{modified}'
        }
    }, {
        region: 'south',
        split: true,
        height: 300,
        layout: 'fit',
        xtype: 'grid',
        bind: '{sampleStore}',
        columns: [
            { header: 'name', dataIndex: 'name' },
            { header: 'age', dataIndex: 'age' }
        ]
    }]
});