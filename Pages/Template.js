Ext.define('Pages.TemplateViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.Template',
    data: {
        title: 'Page title',
    }
});

Ext.define('Page.TemplateController', {
    extend: 'Pages.BaseController',
    alias: 'controller.Template',
    init() {
        const me = this
        me.callParent(arguments)
    }
});

Ext.define('Pages.Template', {
    extend: 'Ext.panel.Panel',

    controller: 'Template',
    viewModel: 'Template',

    alias: 'widget.template',
    iconCls: 'fa fa-cat',

    bind: {
        title: '{title}'
    },

    items: {
        xtype: 'template-component'
    }

});