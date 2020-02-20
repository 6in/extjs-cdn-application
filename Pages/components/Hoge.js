Ext.define('Pages.components.Hoge', {
    extend: 'Ext.Component',
    title: 'MyWidget',
    alias: 'widget.hoge',
    config: {
        title: 'title here'
    },
    constructor(config) {
        this.callParent([config])
        console.log("constructor")
        return
    },
    initComponent() {
        console.log("initComponent")
    },
    renderTpl: '<div id={id}_hoge>this is hoge component</div>',
});
