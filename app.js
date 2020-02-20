Ext.application({
    name: 'extjs cdn base application',

    launch() {

        Ext.Loader.setPath('Pages', './Pages');
        Ext.Loader.setConfig({
            enabled: true
        });
        // ロードするページ一覧
        const pages = ['Pages.MainMenu', 'Pages.Sample',
            'Pages.components.Hoge', 'Pages.components.Monaco']

        require(['vs/editor/editor.main'], () => {
            // ページをロードする
            Ext.require(pages, this.createViewPort);
        });
    },
    createViewPort() {
        // ロード完了後、ビューポートを作成
        Ext.create('Ext.Viewport', {
            renderTo: document.body,
            layout: 'border',
            items: [{
                region: 'west',
                title: 'MainMenu',
                iconCls: 'fa fa-home',
                collapsible: true,
                split: true,
                width: 300,
                xtype: 'mainmenu'
            }, {
                region: 'center',
                layout: 'fit',
                items: {
                    xtype: 'sample'
                }
            }]
        });
    }
});