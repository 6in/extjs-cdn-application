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
            model: 'TreeDataModel',
            root: {
                text: 'root',
                expanded: true,
                children: [
                    {
                        name: 'ツール',
                        expanded: true,
                        children: [
                            {
                                name: '正規表現さん',
                                page: 'Pages.RegExpChecker',
                                description: '正規表現テストツールです',
                                iconCls: 'fa fa-spell-check',
                                leaf: true
                            },
                            {
                                name: 'Diffさん',
                                page: 'Pages.DiffViewer',
                                description: 'お手軽Diff表示ツールです',
                                iconCls: 'fa fa-exchange-alt',
                                leaf: true
                            },
                            {
                                name: '罫線さん',
                                page: 'Pages.KeisenMaker',
                                description: '罫線表の相互変換ツールです',
                                iconCls: 'fa fa-th',
                                leaf: true
                            },
                            {
                                name: 'Dualさん',
                                page: 'Pages.DualMaker',
                                description: 'Dual表を生成します。',
                                iconCls: 'fa fa-table',
                                leaf: true
                            },
                            {
                                name: 'Treeさん',
                                page: 'Pages.TreeMaker',
                                description: 'ツリーテキストを生成します。',
                                iconCls: 'fa fa-stream',
                                leaf: true
                            },
                            {
                                name: 'なんとかケースさん',
                                page: 'Pages.CaseFormatMaker',
                                description: '単語のケースフォーマットの相互変換を行います。',
                                iconCls: 'fa fa-retweet',
                                leaf: true
                            },
                            {
                                name: '汎用テンプレートさん',
                                page: 'Pages.GenericTemplate',
                                description: 'テーブルデータを加工します',
                                iconCls: 'fa fa-cat',
                                leaf: true
                            },
                            {
                                name: '置換さん',
                                page: 'Pages.ReplaceText',
                                description: 'JavaScriptでテキストを置換します',
                                iconCls: 'fa fa-scroll',
                                leaf: true
                            },
                            {
                                name: 'Yaml⇔Json変換さん',
                                page: 'Pages.YamlJsonConverter',
                                description: 'YamlとJsonの相互変換',
                                iconCls: 'fa fa-scroll',
                                leaf: true
                            },
                            {
                                name: '表⇔Json変換さん',
                                page: 'Pages.TableJson',
                                description: '表とJson/Yamlの相互変換',
                                iconCls: 'fa fa-table',
                                leaf: true
                            },
                        ]
                    }
                    , {
                        name: 'サンプル',
                        expanded: true,
                        children: [
                            {
                                name: 'Template',
                                page: 'Pages.Template',
                                description: 'ページテンプレート',
                                // (font-awesome) https://fontawesome.com/icons?d=gallery
                                iconCls: 'fa fa-cat',
                                leaf: true
                            }, {
                                name: 'Monaco',
                                page: 'Pages.MonacoSample',
                                description: 'Monacoエディタサンプル',
                                iconCls: 'fa fa-anchor',
                                leaf: true
                            }, {
                                name: 'Sample',
                                page: 'Pages.ComponentSample',
                                description: 'サンプル',
                                iconCls: 'fa fa-ambulance',
                                leaf: true
                            }, {
                                name: 'FontAwesome',
                                page: 'https://fontawesome.com/v5.15/icons?d=gallery',
                                iconCls: 'fa fa-link',
                                description: 'FontAwesomeギャラリー',
                                leaf: true
                            }, {
                                name: 'SQL.js',
                                page: 'https://sql.js.org/examples/GUI/index.html',
                                iconCls: 'fa fa-link',
                                description: 'sql.js',
                                leaf: true
                            }, {
                                name: 'ExtJS 6.2.0 Doc',
                                page: 'https://docs.sencha.com/extjs/6.2.0/index.html',
                                iconCls: 'fa fa-link',
                                description: 'sql.js',
                                other: true,
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
    static: {
        constYaml: {},
    },
    init() {
        const me = this
        me.callParent(arguments);
        me.constYaml = {};
        me.get('./Pages/resources/const_text.yml').then(({ response, opts }) => {
            Page.MainMenuController.constYaml = YAML.parse(response.responseText);
        });
    },
    afterrender() {
        const me = this
        if (document.location.search.match(/\?page=(\w+)/)) {
            pageName = `Pages.${RegExp.$1}`
            console.log(pageName)
            me.getView().collapse()
            menu = {
                data: { page: pageName },
                isLeaf() { return true }
            }
            me.onMenuSelect(null, menu)
        }
    },
    onMenuSelect(obj, menu) {
        if (!menu.isLeaf()) {
            return;
        }

        // タブパネルを取得
        const me = this;
        const { name, page } = menu.data;
        const tabPanel = me.getView().up('#viewport').down('#targetPage');

        const existsPanel = tabPanel.items.items
            .filter(panel => panel.$className === page);

        if (existsPanel.length === 0) {
            if (page.startsWith("https")) {
                if (menu.data.other) {
                    window.open(page,name)
                } else {
                    const newPanel = tabPanel.add({
                        title: name,
                        layout: 'fit',
                        closable: true,
                        iconCls: menu.data.iconCls,                        
                        items: {
                            xtype: 'iframe',
                            itemId: 'iframe',
                            src: page,
                            src2: page
                        }
                    });
                    tabPanel.setActiveTab(newPanel);
                    me.delay(100, () => {
                        newPanel.down("#iframe").iframe.src = page
                    })    
                }
            } else {
                // ページのロード完了後に表示
                Ext.require(page, () => {
                    try {
                        const newPanel = tabPanel.add(Ext.create(page, {
                            closable: true,
                            iconCls: menu.data.iconCls
                        }));
                        newPanel.getController().constYaml = me.constYaml;
                        newPanel.getController().getViewModel().setData({
                            appName: page
                        })
                        tabPanel.setActiveTab(newPanel);
                    } catch (e) {
                        console.log(e.message);
                        console.log(e.stack);
                    }
                });
            }
        } else {
            tabPanel.setActiveTab(existsPanel[0]);
        }
    },
    onReloadMenu() {
        const me = this
        const menu = me.getViewModel().getStore('menu')
        me.get('./Pages/resources/menu.yml').then(({ response, opts }) => {
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
    },
    listeners: {
        afterrender: 'afterrender'
    }
});