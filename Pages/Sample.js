Ext.define('Pages.SampleViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.Sample',
    data: {
        text: 'sample'
    }
});

Ext.define('Page.SampleController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Sample',
    init() {
        const me = this
        me.callParent(arguments)
        console.log("hello");
    },
    onClickOk() {
        const me = this
        console.log(me.getViewModel().getData().text)
    }
});

Ext.define('Pages.Sample', {
    extend: 'Ext.panel.Panel',

    controller: 'Sample',
    viewModel: 'Sample',

    title: 'Sample-Panel',
    alias: 'widget.sample',

    iconCls: 'fa fa-cat',

    layout: 'fit',
    tbar: [{
        text: 'ok',
        handler: 'onClickOk'
    }],
    items: {
        xtype: 'monaco',
        bind: {
            value: '{text}'
        }
    },
});