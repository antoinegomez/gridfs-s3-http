'use strict';

const mongo = require('mongodb');

export class MongodbNativeClass {

  constructor(opts) {
    this.opts = opts;
    this._isReady = false;
  }

  connect() {
    const port = this.opts.connection.port || 27017;
    this.db = new mongo.Db(this.opts.connection.database, new mongo.Server(this.opts.connection.host, port));
  }

  // @TODO Add more check here to verify we have an actual working connection
  isConnected() {
    return this._isReady;
  }

  async whenReady() {
    if (this.isConnected()) {
      return Promise.resolve();
    }

    return await new Promise((resolve, reject) => {
      this.db.open((err) => {
        if (err) {
          reject(err);
          return;
        }

        this._isReady = true;
        resolve(this.db);
      })
    });
  }

  close() {
    if (!this.isConnected()) {
      return;
    }

    this.db.close();
    this._isReady = false;
  }

  ObjectId(str) {
    return mongo.ObjectId(str);
  }

}

export const Native = (opts) => new MongodbNativeClass(opts);
