Ext.application({
    name: 'extjs cdn base application',

    launch() {

        Ext.Loader.setPath('Pages', './Pages');
        // ロードするページ一覧
        const pages = ['Pages.MainMenu', 'Pages.Sample']

        // ページをロードする
        Ext.require(pages, () => {
            // ロード完了後、ビューポートを作成
            Ext.create('Ext.Viewport', {
                renderTo: document.body,
                layout: 'border',
                items: [{
                    region: 'west',
                    title: 'メニュー',
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
        });
    }
});