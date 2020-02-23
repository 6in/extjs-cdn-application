Ext.define('Pages.ComponentSampleViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.ComponentSample',
    data: {
        title: 'Sample Components',
        url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3243.1897762780477!2d139.66157770469536!3d35.62304777643898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018f4f2bc54ffab%3A0x6e427037e4c90f2d!2z6YO956uL6aeS5rKi44Kq44Oq44Oz44OU44OD44Kv5YWs5ZyS!5e0!3m2!1sja!2sjp!4v1582419108483!5m2!1sja!2sjp',
        rows: [
            [1, 2, 3, 4],
            [1, 2, 3, 4],
        ]
    }
});

Ext.define('Page.ComponentSampleController', {
    extend: 'Pages.BaseController',
    alias: 'controller.ComponentSample',
    init() {
        const me = this
        me.callParent(arguments)
    },
    onGetGridData() {
        const me = this;
        const grid = me.lookupReference('grid');

        console.log(grid.getData());

        console.log(me.getViewModel().getData().rows);
    }
});

Ext.define('Pages.ComponentSample', {
    extend: 'Ext.panel.Panel',

    controller: 'ComponentSample',
    viewModel: 'ComponentSample',

    // iconCls: 'fa fa-ambulance',

    bind: {
        title: '{title}'
    },

    layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    },

    items: [
        {
            title: 'iframe',
            xtype: 'iframe',
            flex: 0.1,
            bind: {
                src: '{url}'
            },
        },
        {
            flex: 0.1,
            title: 'main',
            layout: 'fit',
            tbar: [
                { text: 'Get data', handler: 'onGetGridData' }
            ],
            items: {
                xtype: 'handson-table',
                reference: 'grid',
                // rows: [[1, 2], [1, 2]],
                bind: {
                    data: '{rows}'
                }
            }
        }
    ]

});