Ext.define('TreeDataModel', {
    extend: 'Ext.data.Model',
    alias: 'model.treedata',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'page', type: 'string' },
        { name: 'description', type: 'string' },
    ],
});

Ext.define('Pages.MainMenuViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.MainMenu',
    data: {
        title: 'Page title',
    },
    stores: {
        menu: {
            type: 'tree',
            fields: [
                { name: 'name', type: 'string' },
                { name: 'page', type: 'string' },
                { name: 'description', type: 'string' },
            ],
            root: {
                text: 'root',
                expanded: true,
                children: [{
                    name: 'ツール',
                    expanded: true,
                    children: [
                        {
                            text: 'Template',
                            name: 'Template',
                            page: 'Pages.Template',
                            description: 'ページテンプレート',
                            leaf: true
                        },
                        {
                            text: 'Sample',
                            name: 'Sample',
                            page: 'Pages.Sample',
                            description: 'Monacoエディタサンプル',
                            leaf: true
                        }
                    ]
                }]
            }
        }
    }
});

Ext.define('Page.MainMenuController', {
    extend: 'Pages.BaseController',
    alias: 'controller.MainMenu',
    init() {
        const me = this
        me.callParent(arguments);
    },
    onMenuSelect(obj, menu) {
        if (!menu.isLeaf()) {
            return;
        }

        // タブパネルを取得
        const me = this;
        const { page } = menu.data;
        const tabPanel = me.getView().up('#viewport').down('#targetPage');

        const existsPanel = tabPanel.items.items
            .filter(panel => panel.$className === page);

        if (existsPanel.length === 0) {
            // ページのロード完了後に表示
            Ext.require(page, () => {
                const newPanel = tabPanel.add(Ext.create(page, {
                    closable: true
                }));
                tabPanel.setActiveTab(newPanel);
            });
        } else {
            tabPanel.setActiveTab(existsPanel[0]);
        }
    },
    onReloadMenu() {
        const me = this
        const menu = me.getViewModel().getStore('menu')
        me.get('./Pages/resources/menu.yml').then(({ response, opts }) => {
            debugger
            const menuData = YAML.parse(response.responseText);
            const newMenu = Ext.create('Ext.data.TreeStore', {
                fields: [
                    { name: 'name', type: 'string' },
                    { name: 'page', type: 'string' },
                    { name: 'description', type: 'string' },
                ],
                root: {
                    name: 'root',
                    children: [{
                        name: 'hello',
                        description: 'hello2',
                        expanded: true,
                        children: [
                            { name: 'item1', description: 'comment1', leaf: true },
                            { name: 'item2', description: 'comment2', leaf: true },
                        ]
                    }]
                },
                root2: menuData.root
            });
            menu.getRoot().removeAll();
            menu.setRoot(menuData.root);
            me.getView().refresh();
        })
    }
});

Ext.define('Pages.MainMenu', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mainmenu',

    controller: 'MainMenu',
    viewModel: 'MainMenu',

    layout: 'fit',

    items: {
        xtype: 'treepanel',
        bind: '{menu}',
        rootVisible: false,
        columnLines: true,
        columns: [
            { header: 'name', dataIndex: 'name', width: 200, xtype: 'treecolumn' },
            { header: 'description', dataIndex: 'description', flex: 1 }
        ],
        listeners: {
            itemdblclick: 'onMenuSelect'
        }
    }
});