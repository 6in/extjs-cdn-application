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
    /**
     * 入力ダイアログを表示
     * @param {string}} title タイトル
     * @param {string} message メッセージ
     * @returns {Promise} プロミスオブジェクト。入力された文字列が返却される。
     */
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
    /**
     * 確認ダイアログを表示する
     * @param {string}} title タイトル
     * @param {string} message メッセージ
     * @returns {Promise} プロミスオブジェクト
     */
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
    },
    getConst(key) {
        return Object.assign({}, Page.MainMenuController.constYaml[key]);
    },
    getDb() {
        const me = this
        // appProperties
        // appName,title,properties
        return window.localdb
    },
    async addAppProperty(appName,title,properties) {
        const me = this
        const db = me.getDb()
        return await db.app_properties.add({appName,title,properties})
    },
    async putAppProperty(id,appName,title,properties) {
        const me = this
        const db = me.getDb()
        return await db.app_properties.put({id,appName,title,properties})
    },
    async delAppProperty(id) {
        const me = this
        const db = me.getDb()
        return await db.app_properties.where("id").equals(id).delete()
    },
    async getAppProperties(appName,title = "") {
        const me = this
        const db = me.getDb()
        let queryObject = { appName }
        if (title !== "") {
            queryObject["title"] = title
        }

        return db.app_properties
                .where(queryObject)
                .sortBy("id")
                .then(rows => {
                    return rows.map( row => {
                        return Object.assign(
                            Object.assign({},row.properties),
                            {id: row.id, title: row.title})
                    })
                })
    }
});
