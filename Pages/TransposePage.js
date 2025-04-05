Ext.define('Pages.TransposePageViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TransposePage',
    data: {
        title: '転置さん',
        sourceText: '1\t2\t3\n4\t5\t6\n7\t8\t9',
        resultText: '',
        delimiter: '\t',
        useFirstRowAsHeader: false,
        rotationCount: 0, // 回転回数（正：時計回り、負：反時計回り）
        isTransposed: false, // 転置状態
        isFlippedVertical: false, // 上下反転状態
        isFlippedHorizontal: false // 左右反転状態
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

        // モデルの変更を監視
        const vm = me.getViewModel();

    },

    /**
     * テキストを転置する（行と列を入れ替える）
     */
    transpose() {
        const me = this;
        const vm = me.getViewModel();
        const data = vm.getData();
        const { sourceText, delimiter, useFirstRowAsHeader, isTransposed } = data;

        if (!sourceText) {
            return;
        }

        // 状態を反転
        const newIsTransposed = !isTransposed;
        vm.set('isTransposed', newIsTransposed);

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

            let result = matrix;
            if (newIsTransposed) {
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
                result = transposed;

                // ヘッダー処理
                if (useFirstRowAsHeader && matrix.length > 1) {
                    // 先頭行をヘッダーとして扱う（何もしない、すでに列の先頭に移動している）
                }
            }

            // 結果の2次元配列を文字列に戻す
            const resultText = result.map(row => row.join(delimiter)).join('\n');

            vm.set('resultText', resultText);

            // ボタンのテキストを更新
            const button = me.getView().down('button[handler=transpose]');
            if (button) {
                button.setText(`転置${newIsTransposed ? ' (ON)' : ' (OFF)'}`);
            }
        } catch (e) {
            console.error('転置処理でエラーが発生しました', e);
            vm.set('resultText', `エラー: ${e.message}`);
        }
    },

    /**
     * テキストを時計回り
     */
    rotateRight() {
        const me = this;
        const vm = me.getViewModel();
        const data = vm.getData();
        const { sourceText, delimiter, useFirstRowAsHeader, rotationCount } = data;

        if (!sourceText) {
            return;
        }

        try {
            // 回転回数を更新（時計回り = -1）
            const newRotationCount = rotationCount - 1;
            vm.set('rotationCount', newRotationCount);

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

            // 行列を指定回数だけ左90度回転
            let rotated = matrix;
            const normalizedCount = (((-newRotationCount % 4) + 4) % 4); // 0-3に正規化（右回転の回数として）

            for (let rotation = 0; rotation < normalizedCount; rotation++) {
                const temp = [];
                for (let i = 0; i < maxCols; i++) {
                    const newRow = [];
                    for (let j = rotated.length - 1; j >= 0; j--) {
                        newRow.push(rotated[j][i] || '');
                    }
                    temp.push(newRow);
                }
                rotated = temp;
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
        const { sourceText, delimiter, useFirstRowAsHeader, isFlippedHorizontal } = data;

        if (!sourceText) {
            return;
        }

        // 状態を反転
        const newIsFlippedHorizontal = !isFlippedHorizontal;
        vm.set('isFlippedHorizontal', newIsFlippedHorizontal);

        try {
            // 入力テキストを行に分割
            const rows = sourceText.split(/\r?\n/).filter(row => row.trim() !== '');

            if (rows.length === 0) {
                vm.set('resultText', '');
                return;
            }

            // 各行をデリミタで分割して2次元配列にする
            const matrix = rows.map(row => row.split(delimiter));

            let result = matrix;
            if (newIsFlippedHorizontal) {
                // 各行を反転
                result = matrix.map(row => [...row].reverse());
            }

            // 結果の2次元配列を文字列に戻す
            const resultText = result.map(row => row.join(delimiter)).join('\n');

            vm.set('resultText', resultText);

            // ボタンのテキストを更新
            const button = me.getView().down('button[handler=flipHorizontal]');
            if (button) {
                button.setText(`左右反転${newIsFlippedHorizontal ? ' (ON)' : ' (OFF)'}`);
            }
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
        const { sourceText, delimiter, useFirstRowAsHeader, isFlippedVertical } = data;

        if (!sourceText) {
            return;
        }

        // 状態を反転
        const newIsFlippedVertical = !isFlippedVertical;
        vm.set('isFlippedVertical', newIsFlippedVertical);

        try {
            // 入力テキストを行に分割
            const rows = sourceText.split(/\r?\n/).filter(row => row.trim() !== '');

            if (rows.length === 0) {
                vm.set('resultText', '');
                return;
            }

            // 各行をデリミタで分割して2次元配列にする
            const matrix = rows.map(row => row.split(delimiter));

            let result = matrix;
            if (newIsFlippedVertical) {
                // 行を逆順にする
                result = [...matrix].reverse();
            }

            // 結果の2次元配列を文字列に戻す
            const resultText = result.map(row => row.join(delimiter)).join('\n');

            vm.set('resultText', resultText);

            // ボタンのテキストを更新
            const button = me.getView().down('button[handler=flipVertical]');
            if (button) {
                button.setText(`上下反転${newIsFlippedVertical ? ' (ON)' : ' (OFF)'}`);
            }
        } catch (e) {
            console.error('上下反転処理でエラーが発生しました', e);
            vm.set('resultText', `エラー: ${e.message}`);
        }
    },

    /**
     * 回転回数が変更されたときのハンドラ
     */
    onRotationCountChange(count) {
        const me = this;
        const view = me.getView();
        const rightBtn = view.down('button[handler=rotateRight]');
        const leftBtn = view.down('button[handler=rotateLeft]');

        // 回転回数を0-3に正規化
        const normalizedCount = ((count % 4) + 4) % 4;

        if (rightBtn) {
            rightBtn.setText(`右回転 (${normalizedCount})`);
        }
        if (leftBtn) {
            leftBtn.setText(`左回転 (${((-normalizedCount % 4) + 4) % 4})`);
        }
    },

    /**
     * 入力テキストが変更されたときのハンドラ
     */
    onSourceTextChange(field, newValue) {
        const me = this;
        me.delay(100, () => {
            const vm = me.getViewModel();
            const { isTransposed, isFlippedVertical, isFlippedHorizontal } = vm.getData();

            // 現在の状態に応じて適切な処理を実行
            if (isTransposed) me.transpose();
            if (isFlippedVertical) me.flipVertical();
            if (isFlippedHorizontal) me.flipHorizontal();
        });
    },

    /**
     * デリミタが変更されたときのハンドラ
     */
    onDelimiterChange(field, newValue) {
        const me = this;
        me.delay(100, () => {
            const vm = me.getViewModel();
            const { isTransposed, isFlippedVertical, isFlippedHorizontal } = vm.getData();

            // 現在の状態に応じて適切な処理を実行
            if (isTransposed) me.transpose();
            if (isFlippedVertical) me.flipVertical();
            if (isFlippedHorizontal) me.flipHorizontal();
        });
    },

    /**
     * ヘッダー設定が変更されたときのハンドラ
     */
    onHeaderCheckChange(field, newValue) {
        const me = this;
        me.delay(100, () => {
            const vm = me.getViewModel();
            const { isTransposed, isFlippedVertical, isFlippedHorizontal } = vm.getData();

            // 現在の状態に応じて適切な処理を実行
            if (isTransposed) me.transpose();
            if (isFlippedVertical) me.flipVertical();
            if (isFlippedHorizontal) me.flipHorizontal();
        });
    },

    /**
     * 結果をクリップボードにコピーする
     * モダンなNavigator Clipboard APIを使用し、フォールバックとしてLegacy APIを使用
     */
    async copyToClipboard() {
        const me = this;
        const resultText = me.getViewModel().get('resultText');

        if (!resultText) {
            return;
        }

        try {
            // モダンなClipboard APIを使用
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(resultText);
                Ext.toast('クリップボードにコピーしました');
                return;
            }

            // フォールバック: Legacy API
            const textarea = document.createElement('textarea');
            textarea.value = resultText;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (success) {
                Ext.toast('クリップボードにコピーしました');
            } else {
                throw new Error('コピーに失敗しました');
            }
        } catch (error) {
            console.error('クリップボードへのコピーに失敗しました:', error);
            Ext.toast({
                html: 'クリップボードへのコピーに失敗しました',
                iconCls: 'x-fa fa-exclamation-circle',
                align: 't',
                minWidth: 200
            });
        }
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
                tbar: [
                    '->',
                    {
                        text: '転置',
                        iconCls: 'fa fa-retweet',
                        handler: 'transpose',
                        tooltip: '行と列を入れ替える'
                    }, {
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
                        text: '回転',
                        iconCls: 'fa fa-rotate-right',
                        handler: 'rotateRight',
                        tooltip: '時計回りに90度回転'
                    }
                ],
                items: {
                    xtype: 'monaco',
                    tabSize: 4,
                    options: {
                        insertSpaces: false,
                    },
                    userSoftTab: false,
                    bind: {
                        value: '{sourceText}'
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
                    tabSize: 4,
                    options: {
                        insertSpaces: false,
                    },
                    bind: {
                        value: '{resultText}'
                    }
                }
            }]
        }]
    }
});