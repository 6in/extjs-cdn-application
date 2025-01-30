Ext.define('Sample', {
    extend: 'Ext.Component',
    alias: 'widget.Sample',
    config:  {
        src: '',
        target: '',
    },
    constructor: function(config) {
        this.callParent([config])
        return
    },
}
)