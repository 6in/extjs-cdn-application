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
        regexpUrlBase: 'https://jex.im/regulex',
        regexp_url: 'https://jex.im/regulex/#!embed=true&flags=&re=%5E(a%7Cb)*%3F%24',
        regexpText: '',
        targetText: '',
        // 正規表現へ変換後
        regexpPattern: '^(a|b)*?',
        regexpExtractData: [
            ['LINE_NO', 'GROUP_1', 'GROUP_2', 'GROUP_3', 'GROUP_4'],
        ],
        templateText: '',
    },
    stores: {
        savedRegexp: {
            fields: [
                { name: 'title', type: 'string' },
                { name: 'regexp', type: 'string' },
                { name: 'target', type: 'string' },
            ],
            proxy: {
                type: 'localstorage',
                id: 'regexp',
                reader: {
                    type: 'json'
                }
            }
        }
    }
});

Ext.define('Page.RegExpCheckerController', {
    extend: 'Pages.BaseController',
    alias: 'controller.RegExpChecker',
    init() {
        const me = this
        me.callParent(arguments)
        me.afterrenderFlag = false
        me.lastDecorations = []
        vm = me.getViewModel()
        vm.setData({
            regexpText: '#def abc (ABC)\n#def def (DEF)\n#def ~ \\s+\n\n(abc | def)',
            targetText: 'ABC\nDEF\n'
        })
        vm.getStore('savedRegexp').load();
    },
    /**
     * 画面レンダリング処理後に呼ばれる
     * @param {object}} obj 
     */
    onAfterRender(obj) {
        const me = this;
        me.afterrenderFlag = true
    },
    onChangeRegexpText(obj, val) {
        const me = this;

        me.delay(100, me.onChangeRegexpTextImpl)

    },
    onChangeRegexpTextImpl(me) {
        const vm = me.getViewModel();
        const data = vm.getData();
        let regPattern = null;

        if (!data.regexpText.trim()) {
            return;
        }

        // パターンを生成
        parseResult = RegexpUtil.expandMacro(data.regexpText);
        message = parseResult.keyword
        if (parseResult.error) {
            message = parseResult.error
        }

        // URLを変更
        const regexpUrl = `${data.regexpUrlBase}/?p=${new Date().getTime()}#!embed=true&flags=&re=${encodeURI(parseResult.keyword)}`

        // １行ずつ正規表現であてて、マーカーを設定
        const matchGroups = [];
        const row = ['LINE_NO'];
        for (let i = 0; i < 10; i++) {
            row.push(`GROUP_${i + 1}`)
        }
        matchGroups.push(row);
        const lines = data.targetText.split(/\r?\n/);
        // パターンコンパイル
        pattern = new RegExp(parseResult.keyword, "g");
        const deltaDecorations = []
        lines.forEach((line, lineNo) => {
            if (line.trim() == '') {
                return;
            }
            let maxLoop = 100;
            const matchGroup = [lineNo + 1];
            while (--maxLoop >= 0) {
                regArray = pattern.exec(line)
                if (regArray === null) {
                    // return;
                    break;
                }
                const bgn = regArray.index;
                const end = bgn + regArray[0].length;

                deltaDecorations.push(
                    {
                        range: new monaco.Range(lineNo + 1, bgn + 1, lineNo + 1, end + 1),
                        options: { inlineClassName: 'myLineDecoration' }
                    },
                );
                matchGroup.push(line.slice(bgn, end))
            }
            if (matchGroup.length > 0) {
                matchGroups.push(matchGroup);
            }

        })

        // マーカー設定するエディタ
        const editor = me.lookupReference('targetText').monaco()

        me.lastDecorations = editor.deltaDecorations(me.lastDecorations, deltaDecorations);

        updateData = {
            regexpExtractData: matchGroups
        }
        if (data.regexp_url !== regexpUrl) {
            updateData['regexp_url'] = regexpUrl
        }
        if (data.regexpPattern !== message) {
            updateData['regexpPattern'] = message
        }

        vm.setData(updateData);

        me.onChangeTemplate();
    },
    onChangeTemplate() {
        const me = this;
        const template = new Ext.Template(me.lookupReference('txtTemplate').getValue());
        const data = me.getViewModel().getData();
        const result = [];
        const head = data.regexpExtractData[0];
        data.regexpExtractData.slice(1).forEach(row => {
            rowData = {};
            head.forEach((field, i) => {
                rowData[field] = row[i];
            });
            result.push(template.apply(rowData));
        });

        me.getViewModel().setData({
            templateText: result.join('\n')
        });
    },
    onAddRegExp() {
        const me = this;
        me.prompt('追加', 'タイトルを入力して下さい。').then((text) => {
            const store = me.getViewModel().getStore('savedRegexp');
            const vm = me.getViewModel().getData();
            store.add({
                title: text,
                regexp: vm.regexpText,
                target: vm.targetText,
            });
            store.sync();
        })
    },
    onDeleteRegExp() {
        const me = this;
        const store = me.getViewModel().getStore('savedRegexp');
        const grid = me.lookupReference('grid');
        const sm = grid.getSelectionModel();
        const rec = sm.getSelected();
        if (rec.items.length === 0) {
            Ext.Msg.alert('エラー', '削除するレコードを選択して下さい。');
            return;
        }
        store.remove(rec.items[0]);
        store.sync();
    },
    onSelectRegExp(obj, rec) {
        const me = this;
        me.confirm('確認', '選択した正規表現を編集しますか？').then(() => {
            const vm = me.getViewModel();
            vm.setData({
                regexpText: rec.data.regexp,
                targetText: rec.data.target,
            });
        });
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
                    iconCls: 'fa fa-plus',
                    handler: 'onAddRegExp'
                },
                {
                    text: '削除',
                    iconCls: 'fa fa-trash',
                    handler: 'onDeleteRegExp'
                },
            ],
            layout: 'fit',
            items: {
                xtype: 'grid',
                reference: 'grid',
                bind: '{savedRegexp}',
                columns: [
                    { header: 'タイトル', dataIndex: 'title', flex: 1 },
                ],
                listeners: {
                    itemdblclick: 'onSelectRegExp'
                }

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
                    },
                    listeners: {
                        change: 'onChangeRegexpText'
                    }
                },
                // tbar: [
                //     {
                //         xtype: 'label',
                //         text: 'オプション:'
                //     }, {
                //         xtype: 'segmentedbutton',
                //         defaultUI: "default-toolbar",
                //         reference: 'createTypeCombo',
                //         value: 'Normal',
                //         items: [
                //             {
                //                 text: 'IgnoreCase',
                //                 value: 'Normal'
                //             }, {
                //                 text: 'MultiLine',
                //                 value: 'MultiLine'
                //             }, {
                //                 text: 'GlobalMatch',
                //                 value: 'GlobalMatch'
                //             }
                //         ],
                //         listeners: {
                //             change: 'onChangeRegexpText'
                //         }
                //     }
                // ],
                buttons: [
                    {
                        xtype: 'label',
                        text: '正規表現:'
                    },
                    // {
                    //     xtype: 'segmentedbutton',
                    //     defaultUI: "default-toolbar",
                    //     reference: 'createTypeCombo',
                    //     value: 'Normal',
                    //     items: [
                    //         {
                    //             text: 'Normal',
                    //             value: 'Normal'
                    //         }, {
                    //             text: 'Java',
                    //             value: 'Java'
                    //         }, {
                    //             text: 'Java-Properties',
                    //             value: 'Java_Prop'
                    //         }
                    //     ],
                    //     listeners: {
                    //         change: 'onChangeRegexpText'
                    //     }
                    // },
                    {
                        xtype: 'textfield',
                        flex: 1,
                        reference: 'regexpPattern',
                        bind: {
                            value: '{regexpPattern}'
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
                        reference: 'targetText',
                        bind: {
                            value: '{targetText}'
                        },
                        listeners: {
                            change: 'onChangeRegexpText'
                        }
                    },
                    {
                        title: '抽出文字列',
                        layout: 'fit',
                        items: {
                            xtype: 'handson-table',
                            bind: {
                                data: '{regexpExtractData}'
                            }
                        }
                    },
                    {
                        title: '簡易テンプレート',
                        tbar: [
                            {
                                xtype: 'textfield',
                                boxLabel: 'テンプレート',
                                reference: 'txtTemplate',
                                value: '{GROUP_1}-{GROUP_2}-{GROUP_3}',
                                flex: 1,
                                listeners: {
                                    change: 'onChangeTemplate'
                                }
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
    ],
    listeners: {
        afterrender: 'onAfterRender'
    }

});