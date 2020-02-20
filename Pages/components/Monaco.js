Ext.define('Pages.components.Monaco', {
    extend: 'Ext.Component',
    alias: 'widget.monaco',
    config: {
        value: 'title here'
    },
    twoWayBindable: [
        'value'
    ],
    renderTpl: '<div id="{id}_monaco" style="width:100%;height:100%"></div>',
    constructor(config) {
        this.callParent([config])
        console.log("constructor")
        return
    },
    initComponent() {
        console.log("initComponent")
    },
    getValue() {
        if (this.editor) {
            return this.editor.getValue();
        }
        return '';
    },
    setValue(text) {
        if (this.editor) {
            if (this.editor.getValue() !== text) {
                this.editor.setValue(text);
            }
        }
        this.callParent([text])
    },
    listeners: {
        afterrender() {
            const me = this
            const id = `${me.getId()}_monaco`
            me.targetDiv = document.getElementById(id)
            const options = {
                automaticLayout: true,
                fontSize: 14,
                tabSize: 2,
                theme: 'vs-dark',
                minimap: {
                    enabled: true
                }
            }
            me.editor = monaco.editor.create(me.targetDiv, options);
            me.editor.onDidChangeModelContent(event => {
                const value = me.editor.getValue();
                me.fireEvent('change', me, [me.editor.getValue()]);
                me.setValue(value);
            });
        },
        resize(obj, width, height) {
            const me = this
            if (me.editor) {
                me.editor.layout();
            }
        }
    }
});
