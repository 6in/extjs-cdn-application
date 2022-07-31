Ext.application({
    name: 'extjs cdn base application',

    launch() {
        Ext.Loader.setPath('Pages', './Pages');
        Ext.Loader.setConfig({
            enabled: true
        });

        new Promise((resolve, reject) => {
            // Monacoエディタのロードを先に行う
            require(['vs/editor/editor.main'], () => {
                resolve()
            })
        }).then((respose) => {
            // あらかじめロードするコンポーネント一覧
            const pages = [
                'Pages.BaseController',
                'Pages.MainMenu',
                'Pages.Readme',
                'Pages.components.TemplateComponent',
                'Pages.components.Monaco',
                'Pages.components.MonacoDiff',
                'Pages.components.Iframe',
                'Pages.components.HandsonTable',
                'Pages.components.Markdown',
                'Pages.components.Mermaid',
                'Pages.components.Utils',
                'Pages.components.TemplateUtils',
                'Pages.components.AppProperty',
            ]
            // ページをロードする
            Ext.require(pages, this.createViewPort);
        })
    },
    createViewPort() {
        // ロード完了後、ビューポートを作成
        const viewPort = Ext.create('Ext.Viewport', {
            renderTo: document.body,
            layout: 'border',
            itemId: 'viewport',
            items: [{
                region: 'west',
                title: 'Home',
                itemId: 'mainmenu',
                iconCls: 'fa fa-home',
                collapsible: true,
                split: true,
                width: 400,
                xtype: 'mainmenu'
            }, {
                region: 'center',
                layout: 'fit',
                xtype: 'tabpanel',
                itemId: 'targetPage',
                items: [{
                    xtype: 'readme'
                }]
            }]
        });

        // IndexedDBを準備
        window.localdb = new Dexie("CacheDB");
        window.localdb.version(1).stores({
            app_properties: "++id,appName,title,properties",
            friends: '++id, name, age'
        });

        initSqlJs({}).then(function (SQL) {
            console.log("sqlite try init")
            window.sqlitedb = new SQL.Database();
            window.sqlitedb.exec("select 1;")
            console.log("sqlite try success")
        });
    }
});