Ext.define('Pages.TransposePageViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TransposePage',
    data: {
        title: '転置さん',
        sourceText: '1\t2\t3\n4\t5\t6\n7\t8\t9',
        resultText: '',
        delimiter: '\t',
        useFirstRowAsHeader: false
    },
    stores: {

    }
});

Ext.define('Page.TransposePageController', {
    extend: 'Pages.BaseController',
    alias: 'controller.TransposePage',
    init() {
        const me = this;
        me.callParent(arguments);
    },

    /**
     * テキストを転置する（行と列を入れ替える）
     */
    transpose() {
        const me = this;
        const vm = me.getViewModel();
        const data = vm.getData();
        const { sourceText, delimiter, useFirstRowAsHeader } = data;

        if (!sourceText) {
            return;
        }
        const source = sourceText;
        try {
            // 入力テキストを行に分割
            const rows = source.split(/\r?\n/).filter(row => row.trim() !== '');

            if (rows.length === 0) {
                vm.set('resultText', '');
                return;
            }

            // 各行をデリミタで分割して2次元配列にする
            const matrix = rows.map(row => row.split(delimiter));

            // 最大列数を取得
            const maxCols = Math.max(...matrix.map(row => row.length));

            // 行と列を入れ替えた新しい2次元配列を作成
            const transposed = [];
            for (let i = 0; i < maxCols; i++) {
                const newRow = [];
                for (let j = 0; j < matrix.length; j++) {
                    // 元の行にその列が存在しない場合は空文字を追加
                    newRow.push(matrix[j][i] || '');
                }
                transposed.push(newRow);
            }

            // ヘッダー処理
            if (useFirstRowAsHeader && matrix.length > 1) {
                // 先頭行をヘッダーとして扱う（何もしない、すでに列の先頭に移動している）
            }

            // 結果の2次元配列を文字列に戻す
            const resultText = transposed.map(row => row.join(delimiter)).join('\n');

            vm.set('resultText', resultText);
        } catch (e) {
            console.error('転置処理でエラーが発生しました', e);
            vm.set('resultText', `エラー: ${e.message}`);
        }
    },

    /**
     * テキストを右に90度回転する（時計回り）
     */
    rotateRight() {
        const me = this;
        const vm = me.getViewModel();
        const data = vm.getData();
        const { sourceText, delimiter, useFirstRowAsHeader } = data;

        if (!sourceText) {
            return;
        }

        try {
            // 入力テキストを行に分割
            const rows = sourceText.split(/\r?\n/).filter(row => row.trim() !== '');

            if (rows.length === 0) {
                vm.set('resultText', '');
                return;
            }

            // 各行をデリミタで分割して2次元配列にする
            const matrix = rows.map(row => row.split(delimiter));

            // 最大列数を取得
            const maxCols = Math.max(...matrix.map(row => row.length));

            // 行列を右90度回転
            const rotated = [];
            for (let i = 0; i < maxCols; i++) {
                const newRow = [];
                for (let j = matrix.length - 1; j >= 0; j--) {
                    // 元の行にその列が存在しない場合は空文字を追加
                    newRow.push(matrix[j][i] || '');
                }
                rotated.push(newRow);
            }

            // 結果の2次元配列を文字列に戻す
            const resultText = rotated.map(row => row.join(delimiter)).join('\n');

            vm.set('resultText', resultText);
        } catch (e) {
            console.error('右回転処理でエラーが発生しました', e);
            vm.set('resultText', `エラー: ${e.message}`);
        }
    },

    /**
     * テキストを左に90度回転する（反時計回り）
     */
    rotateLeft() {
        const me = this;
        const vm = me.getViewModel();
        const data = vm.getData();
        const { sourceText, delimiter, useFirstRowAsHeader } = data;

        if (!sourceText) {
            return;
        }

        try {
            // 入力テキストを行に分割
            const rows = sourceText.split(/\r?\n/).filter(row => row.trim() !== '');

            if (rows.length === 0) {
                vm.set('resultText', '');
                return;
            }

            // 各行をデリミタで分割して2次元配列にする
            const matrix = rows.map(row => row.split(delimiter));

            // 最大列数を取得
            const maxCols = Math.max(...matrix.map(row => row.length));

            // 行列を左90度回転
            const rotated = [];
            for (let i = maxCols - 1; i >= 0; i--) {
                const newRow = [];
                for (let j = 0; j < matrix.length; j++) {
                    // 元の行にその列が存在しない場合は空文字を追加
                    newRow.push(matrix[j][i] || '');
                }
                rotated.push(newRow);
            }

            // 結果の2次元配列を文字列に戻す
            const resultText = rotated.map(row => row.join(delimiter)).join('\n');

            vm.set('resultText', resultText);
        } catch (e) {
            console.error('左回転処理でエラーが発生しました', e);
            vm.set('resultText', `エラー: ${e.message}`);
        }
    },

    /**
     * テキストを左右反転する（水平反転）
     */
    flipHorizontal() {
        const me = this;
        const vm = me.getViewModel();
        const data = vm.getData();
        const { sourceText, delimiter, useFirstRowAsHeader } = data;

        if (!sourceText) {
            return;
        }

        try {
            // 入力テキストを行に分割
            const rows = sourceText.split(/\r?\n/).filter(row => row.trim() !== '');

            if (rows.length === 0) {
                vm.set('resultText', '');
                return;
            }

            // 各行をデリミタで分割して2次元配列にする
            const matrix = rows.map(row => row.split(delimiter));

            // 各行を反転
            const flipped = matrix.map(row => [...row].reverse());

            // 結果の2次元配列を文字列に戻す
            const resultText = flipped.map(row => row.join(delimiter)).join('\n');

            vm.set('resultText', resultText);
        } catch (e) {
            console.error('左右反転処理でエラーが発生しました', e);
            vm.set('resultText', `エラー: ${e.message}`);
        }
    },

    /**
     * テキストを上下反転する（垂直反転）
     */
    flipVertical() {
        const me = this;
        const vm = me.getViewModel();
        const data = vm.getData();
        const { sourceText, delimiter, useFirstRowAsHeader } = data;

        if (!sourceText) {
            return;
        }

        try {
            // 入力テキストを行に分割
            const rows = sourceText.split(/\r?\n/).filter(row => row.trim() !== '');

            if (rows.length === 0) {
                vm.set('resultText', '');
                return;
            }

            // 各行をデリミタで分割して2次元配列にする
            const matrix = rows.map(row => row.split(delimiter));

            // 行を逆順にする
            const flipped = [...matrix].reverse();

            // 結果の2次元配列を文字列に戻す
            const resultText = flipped.map(row => row.join(delimiter)).join('\n');

            vm.set('resultText', resultText);
        } catch (e) {
            console.error('上下反転処理でエラーが発生しました', e);
            vm.set('resultText', `エラー: ${e.message}`);
        }
    },

    /**
     * 入力テキストが変更されたときのハンドラ
     */
    onSourceTextChange(field, newValue) {
        const me = this;
        me.delay( 100, () => {
            me.transpose();
        });
    },

    /**
     * デリミタが変更されたときのハンドラ
     */
    onDelimiterChange(field, newValue) {
        const me = this;
        me.delay( 100, () => {
            me.transpose();
        });
    },

    /**
     * ヘッダー設定が変更されたときのハンドラ
     */
    onHeaderCheckChange(field, newValue) {
        const me = this;
        me.delay( 100, () => {
            me.transpose();
        });
    },

    /**
     * 結果をクリップボードにコピーする
     */
    copyToClipboard() {
        const me = this;
        const resultText = me.getViewModel().get('resultText');

        if (!resultText) {
            return;
        }

        // テキストエリアを作成して選択、コピー
        const textarea = document.createElement('textarea');
        textarea.value = resultText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        Ext.toast('クリップボードにコピーしました');
    }
});

Ext.define('Pages.TransposePage', {
    extend: 'Ext.panel.Panel',

    controller: 'TransposePage',
    viewModel: 'TransposePage',

    bind: {
        title: '{title}'
    },

    layout: 'border',

    items: {
        region: 'center',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },

        bodyPadding: 10,

        tbar: [
            {
                xtype: 'textfield',
                fieldLabel: 'デリミタ',
                width: 150,
                listeners: {
                    change: 'onDelimiterChange'
                },
                bind: {
                    value: '{delimiter}'
                }
            }, {
                xtype: 'checkbox',
                boxLabel: '先頭行をヘッダーとして扱う',
                bind: {
                    value: '{useFirstRowAsHeader}'
                },
                inputValue: true,
                uncheckedValue: false,
                width: 200,
                listeners: {
                    change: 'onHeaderCheckChange'
                }
            }, '->', {
                text: '上下反転',
                iconCls: 'fa fa-arrows-v',
                handler: 'flipVertical',
                tooltip: '行列を上下に反転'
            }, {
                text: '左右反転',
                iconCls: 'fa fa-arrows-h',
                handler: 'flipHorizontal',
                tooltip: '行列を左右に反転'
            }, {
                text: '左回転',
                iconCls: 'fa fa-rotate-left',
                handler: 'rotateLeft',
                tooltip: '反時計回りに90度回転'
            }, {
                text: '右回転',
                iconCls: 'fa fa-rotate-right',
                handler: 'rotateRight',
                tooltip: '時計回りに90度回転'
            }],

        items: [{
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            flex: 1,
            items: [{
                xtype: 'panel',
                title: '入力テキスト',
                flex: 1,
                layout: 'fit',
                items: {
                    xtype: 'monaco',
                    bind: {
                        value: '{sourceText}'
                    },
                    listeners: {
                        change: 'onSourceTextChange'
                    }
                }
            }, {
                xtype: 'splitter'
            }, {
                xtype: 'panel',
                title: '結果',
                flex: 1,
                layout: 'fit',
                tbar: [{
                    text: 'コピー',
                    iconCls: 'fa fa-copy',
                    handler: 'copyToClipboard'
                }],
                items: {
                    xtype: 'monaco',
                    readOnly: true,
                    bind: {
                        value: '{resultText}'
                    }
                }
            }]
        }]
    }
});