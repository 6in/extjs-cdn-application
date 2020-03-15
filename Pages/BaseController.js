/**
 * 共通処理等をここに記述
 */

Ext.define('Pages.BaseController', {
    extend: 'Ext.app.ViewController',
    init() {
        const me = this
        me.callParent(arguments)
    },
    post(url, data = {}, headers = {}) {

    },
    get(url) {
        return new Promise((resolve, reject) => {
            Ext.Ajax.request({
                url: url,
                success(response, opts) {
                    resolve({ response, opts });
                },
                failure(response, opts) {
                    reject({ response, opts })
                }
            })
        });
    },
    /**
     * 遅延処理を実行
     * @param {number} delayMillSec 
     * @param {object} handler 
     */
    delay(delayMillSec, handler) {
        const me = this
        new Promise((resolve, reject) => {
            window.setTimeout(() => {
                resolve(handler(me))
            }, delayMillSec);
        })
    },
    prompt(title, message) {
        return new Promise((resolve, reject) => {
            Ext.Msg.prompt(title, message, (button, text) => {
                if (button === 'ok') {
                    resolve(text)
                } else {
                    reject(button);
                }
            })
        })
    },
    confirm(title, message) {
        return new Promise((resolve, reject) => {
            Ext.Msg.confirm(title, message, (button) => {
                if (button === 'yes') {
                    resolve(button);
                } else {
                    reject(button);
                }
            })
        })
    }
});
