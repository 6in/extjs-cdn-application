Ext.define("RegexpUtil", {
    statics: {
        expandMacro: function (keyword) {
            var e, error, i, j, key, keys, len, len1, line, lines, reComnt, reMacro, reg, regMap, repOrderKey, source, test, val;
            if (!keyword) {
                return;
            }
            keyword = keyword.replace(/\?<\w+>/g, "");
            lines = keyword.split("\n");
            reMacro = /^#def\s+(\S+)\s+(.+)$/;
            reComnt = /^#.+$/;
            regMap = {};
            keys = [];
            source = [];
            for (i = 0, len = lines.length; i < len; i++) {
                line = lines[i];
                if (reMacro.test(line)) {
                    key = RegExp.$1;
                    val = RegExp.$2;
                    regMap[key] = val.replace(/\s+/g, "");
                    keys.push(key);
                } else if (reComnt.test(line)) {
                    1;
                } else {
                    source.push(line);
                }
            }
            repOrderKey = keys.sort(function (a, b) {
                if (a.length < b.length) {
                    return 1;
                } else if (a.length === b.length) {
                    return 0;
                } else {
                    return -1;
                }
            });
            line = source.join("").replace(/\s+/g, "");
            for (j = 0, len1 = repOrderKey.length; j < len1; j++) {
                key = repOrderKey[j];
                line = line.replace(new RegExp(key, "g"), regMap[key]);
            }
            keyword = line;
            error = "";
            try {
                test = keyword;
                if (test.indexOf("(?") >= 0) {
                    test = keyword.replace(/\(\?\w+\)/g, "");
                }
                reg = new RegExp(test);
            } catch (_error) {
                e = _error;
                error = e.toString();
            }
            return {
                keyword: keyword,
                error: error
            };
        },
        escapeJava: function (text) {
            return text.replace(/\\/g, "\\\\");
        },
        unescapeJava: function (text) {
            return text.replace(/\\\\/g, "\\");
        },
        escapeProp: function (text) {
            return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,");
        },
        unescapeProp: function (text) {
            return text.replace(/\\\\/g, "\\").replace(/\\,/g, ",");
        }
    }
});

Ext.define('Pages.RegExpCheckerViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.RegExpChecker',
    data: {
        title: '正規表現さん',
        source: '',
        regexp_url: 'https://jex.im/regulex/#!embed=true&flags=&re=%5E(a%7Cb)*%3F%24',
        regexpText: '',
        targetText: '',
        rexexpExtractData: [
            ['group1', 'group2', 'group3', 'group4'],
        ],
        templateText: '',
        message: '^(a|b)*?',
    },
    stores: {
        savedRegexp: {
            field: [
                { name: 'name', type: 'string' },
                { name: 'regexp', type: 'string' },
            ]
        }
    }
});

Ext.define('Page.RegExpCheckerController', {
    extend: 'Pages.BaseController',
    alias: 'controller.RegExpChecker',
    init() {
        const me = this
        me.callParent(arguments)

        vm = me.getViewModel()
        vm.setData({
            regexpText: `#def abc .+
#def def .?
#def ~ \s+

abc ~ def`,
            targetText: `abcdefgxyz
hijklmnssssss
`
        })

    },
    regexpChange(obj, val) {

    }
});

Ext.define('Pages.RegExpChecker', {
    extend: 'Ext.panel.Panel',

    controller: 'RegExpChecker',
    viewModel: 'RegExpChecker',

    bind: {
        title: '{title}'
    },

    layout: {
        type: 'border',
        regionWeights: {
            west: 20,
            north: 10,
            source: -10,
            east: -20
        }
    },

    items: [
        {
            region: 'west',
            width: 300,
            title: '保存済み正規表現',
            split: true,
            collapsible: true,
            tbar: [
                {
                    text: '追加',
                    iconCls: 'fa fa-plus'
                }
            ],
            layout: 'fit',
            items: {
                xtype: 'grid',
                bind: '{savedRegexp}',
                columns: [
                    { header: 'name', dataIndex: 'name', flex: 1 },
                ]
            }
        },
        {
            region: 'center',
            layout: 'border',
            items: [{
                region: 'north',
                height: 400,
                title: '拡張正規表現',
                layout: 'fit',
                items: {
                    xtype: 'monaco',
                    bind: {
                        value: '{regexpText}'
                    }
                },
                tbar: [
                    {
                        xtype: 'label',
                        text: 'オプション:'
                    }, {
                        xtype: 'segmentedbutton',
                        defaultUI: "default-toolbar",
                        reference: 'createTypeCombo',
                        value: 'Normal',
                        items: [
                            {
                                text: 'IgnoreCase',
                                value: 'Normal'
                            }, {
                                text: 'MultiLine',
                                value: 'MultiLine'
                            }, {
                                text: 'GlobalMatch',
                                value: 'GlobalMatch'
                            }
                        ],
                        listeners: {
                            change: 'regexpChange'
                        }
                    }
                ],
                buttons: [
                    {
                        xtype: 'label',
                        text: '生成タイプ:'
                    }, {
                        xtype: 'segmentedbutton',
                        defaultUI: "default-toolbar",
                        reference: 'createTypeCombo',
                        value: 'Normal',
                        items: [
                            {
                                text: 'Normal',
                                value: 'Normal'
                            }, {
                                text: 'Java',
                                value: 'Java'
                            }, {
                                text: 'Java-Properties',
                                value: 'Java_Prop'
                            }
                        ],
                        listeners: {
                            change: 'regexpChange'
                        }
                    }, {
                        xtype: 'textfield',
                        flex: 1,
                        reference: 'message',
                        bind: {
                            value: '{message}'
                        }
                    }
                ],
            },
            {
                region: 'north',
                height: 280,
                title: 'ダイアグラム',
                layout: 'fit',
                split: true,
                collapsible: true,
                items: {
                    xtype: 'iframe',
                    bind: {
                        src: '{regexp_url}'
                    }
                }
            },
            {
                region: 'center',
                height: 200,
                title: '検査対象／結果',
                xtype: 'tabpanel',
                items: [
                    {
                        title: '検査文字列',
                        layout: 'fit',
                        xtype: 'monaco',
                        bind: {
                            value: '{targetText}'
                        }
                    },
                    {
                        title: '抽出文字列',
                        layout: 'fit',
                        items: {
                            xtype: 'handson-table',
                            bind: {
                                data: '{rexexpExtractData}'
                            }
                        }
                    },
                    {
                        title: '簡易テンプレート',
                        tbar: [
                            {
                                xtype: 'textfield',
                                boxLabel: 'テンプレート',
                                value: '{group1}-{group2}-{group3}',
                                flex: 1,
                            }
                        ],
                        layout: 'fit',
                        items: {
                            xtype: 'monaco',
                            bind: {
                                value: '{templateText}'
                            }
                        }
                    },
                ]
            },
            ]
        }
    ]

});