Ext.define('Pages.UnitTestViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.UnitTest',
    data: {
        title: 'UnitTest',
    },
    stores: {

    }
});

Ext.define('Pages.UnitTestController', {
    extend: 'Pages.BaseController',
    alias: 'controller.UnitTest',
    init() {
        const me = this
        me.callParent(arguments)
    },
    async onClickIndexedDBTest() {
        const me = this
        debugger
        let data = await me.getAppProperties("test")
        console.log(JSON.stringify(data,null,2))

        let id = await me.addAppProperty("test","add-title",{a:1,b:2})
        console.log(id)
        data = await me.getAppProperties("test")
        console.log(JSON.stringify(data,null,2))

        id = await me.putAppProperty(id, "test","put-title",{a:1,b:2})
        console.log(id)
        data = await me.getAppProperties("test")
        console.log(JSON.stringify(data,null,2))

        id = await me.delAppProperty(id)
        console.log(id)
        data = await me.getAppProperties("test")
        console.log(JSON.stringify(data,null,2))
    }
});

Ext.define('Pages.UnitTest', {
    extend: 'Ext.panel.Panel',

    controller: 'UnitTest',
    viewModel: 'UnitTest',

    bind: {
        title: '{title}'
    },

    tbar: [
        {
            text: 'IndexedDB Test',
            handler: 'onClickIndexedDBTest'
        }
    ],

    items: {
        xtype: 'template-component'
    }

});