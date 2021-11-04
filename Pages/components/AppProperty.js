
Ext.define('AppProperty', {
  extend: 'Ext.data.Model',
  fields: [
      {name: 'id',  type: 'int'},
      {name: 'appName',   type: 'string'},
      {name: 'name', type: 'string'},
      {name: 'props', type: 'auto'}
  ],
});

Ext.define("Pages.components.AppProperty",{
  config: {
    dbName: 'ExtJs-CDN-Application2' ,
    appName: null,
    tableName: 'appProperties',
    dbInstance: null
  },
  constructor (config) {
    this.initConfig(config);
    return this;
  },
  db() {
    const me = this
    let db = me.getDbInstance()
    if (db === null ){
      db = new Dexie(me.dbName)
      me.setDbInstance(db);
      // Declare tables, IDs and indexes
      db.version(1).stores({
        [me.getTableName()]: 'appName,name,props'
      }); 
    }
    return db;
  },
  getProperties() {
    const me = this
    return me.db()[me.getTableName()]
      //.where('appName').equals(me.getAppName())
      .toArray()
  },
  getPropertyById(id) {
    const me = this
    return AppProperty.dbInstance 
  },
  getPropertyByName(appName,name) {
    const me = this
    return AppProperty.dbInstance 
  },
  upsert(id,name,props) {
    const me = this
    const db = me.db()
    const rec = {
      appName: me.getAppName(), name, props
    }
    if (id) {
      return db.appProperties.put(rec,id)
    } else {
      return db.appProperties.add(rec)
    }
  },
  removeProperty(appName,id) {
    AppProperty.initPropertyTable()

  }  
})