Ext.define('Pages.CivetTemplateViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.CivetTemplate',
    data: {
        title: 'Civet Template',
    },

    stores: {
    },
}
)

Ext.define('Page.CivetTemplateController', {
    extend: 'Pages.BaseController',
    alias: 'controller.CivetTemplate',
    init: async function() {
        const me = this
        me.callParent(arguments)

        me.appProperty = Ext.create('Pages.components.AppProperty', {
            appName:'civet',
        }
        )
        const props = await me.appProperty.getProperties()

        return me.delay(200, function() {
            return props.forEach(( function(prop) {
                const tab = me.addTab(prop)
                return me.onChangeText(tab.down('monaco'), [prop.props.text])
            }
            ))
        })
    },

    addTab: function(prop) {
        const me = this
        const tabs = me.lookupReference('tabs')
        const tab = tabs.add({
            title: prop.name,
            layout: 'fit',
            closable: true,
            listeners: {
                close: 'onCloseTab',
            },
            items: {
                xtype: 'monaco',
                itemId: `memo${prop.id}`,
                propId: prop.id,
                tabSize: 4,
                value: prop.props.text,
                listeners: {
                    change: 'onChangeText'
                }
            }
        })
        tabs.setActiveTab(tab)
        return tab
    },

    onChangeText: async function(obj, value) {
        const {me} = this.me()

        const name = obj.itemId
        const id =  await me.appProperty.upsert(obj.propId, name, {text: value[0]})
        const headLine = value[0].split('\n')[0]
        const m = headLine.match(/.*lang:(?<lang>\w+)/)
        if (m) {
            obj.changeLanguage(m.groups.lang)
        }
        if (!obj.propId) { return obj.propId = id };return
    },

    addRec: async function() {
        const {me} = this.me()
        const newId = await me.appProperty.upsert(null, '', {text: ''})
        const prop = {id: newId, name: `memo${newId}`, props: {text: '# lang:python\nprint("hello")'}}
        const tab = me.addTab(prop)
        return me.onChangeText(tab.down('monaco'), [prop.props.text])
    },

    me: function() {
        const me = this
        const vm = this.getViewModel()
        const data = vm.getData()
        return {me,vm,data}
    },

    onClearAll: async function() {
        const {me} = this.me()
        debugger
        if (await me.confirm("確認","全データを削除してよろしいですか？") === 'yes') {
            me.appProperty.clearAll() 
            const tabs = me.lookupReference('tabs')
            return tabs.removeAll()
        };return
    },

    onCloseTab: function(obj) {
        const {me}  = this.me()
        const id = obj.down('monaco').propId
        if (id === undefined) { return }
        return me.appProperty.delete(id)
    },
}
)

Ext.define('Pages.CivetTemplate', {
    extend: 'Ext.panel.Panel',

    controller: 'CivetTemplate',
    viewModel: 'CivetTemplate',

    tbar: [
        {text: 'add',
        handler: 'addRec'}
    ,
        '->'
    ,
        {text: 'clear',
        handler: 'onClearAll'}
    ],

    bind: {
        title: '{title}',
    },

    layout: 'fit',
    items: {
        xtype: 'tabpanel',
        reference: 'tabs',
        items: [
        ],
    },
}
)