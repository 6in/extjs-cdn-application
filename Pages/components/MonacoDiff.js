Ext.define('Pages.components.MonacoDiff', {
    extend: 'Ext.Component',
    alias: 'widget.monacodiff',
    config: {
        original: '',
        modified: '',
        options: {}
    },
    renderTpl: '<div id="{id}_monacodiff" style="width:100%;height:100%"></div>',
    constructor(config) {
        this.callParent([config])
        return
    },
    initComponent() {
    },
    setOriginal(text) {
        const me = this
        this.callParent([text])
        me.setModel();
    },
    setModified(text) {
        const me = this
        this.callParent([text])
        me.setModel();
    },
    setModel() {
        const me = this
        if (!me.editor) {
            return;
        }
        const originalModel = monaco.editor.createModel(me.getOriginal());
        let modified = me.getModified();
        if (modified.trim() == "") {
            modified = me.editor.getModifiedEditor().getValue();
        }
        const modifiedModel = monaco.editor.createModel(modified);
        me.editor.setModel({
            original: originalModel,
            modified: modifiedModel
        });
    },
    listeners: {
        afterrender() {
            const me = this
            const id = `${me.getId()}_monacodiff`
            me.targetDiv = document.getElementById(id)
            const options = Object.assign({},
                me.getOptions());

            me.editor = monaco.editor.createDiffEditor(me.targetDiv, options);
            me.setModel()
            me.editor.getOriginalEditor().updateOptions({readOnly:false})

            // me.editor.getOriginalEditor().onDidChangeModelContent(event => {
            //     const value = me.editor.getOriginalEditor().getValue();
            //     me.fireEvent('change', me, [value]);
            //     me.setOriginal(value);
            // });
            // me.editor.getModifiedEditor().onDidChangeModelContent(event => {
            //     const value = me.editor.getModifiedEditor().getValue();
            //     me.fireEvent('change', me, [value]);
            //     me.setModified(value);
            // });
        },
        resize(obj, width, height) {
            const me = this
            if (me.editor) {
                me.editor.layout();
            }
        }
    },
    monaco() {
        const me = this;
        if (me.editor) {
            return me.editor
        }
        return null;
    }
});
