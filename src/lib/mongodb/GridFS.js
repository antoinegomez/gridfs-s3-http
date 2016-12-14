'use strict';

import { Native } from './Native';
import mongo from 'mongodb';
const Grid = require('gridfs-locking-stream');


export class GridFSClass {

  constructor(opts) {
    if (typeof opts !== 'object' || opts === null) {
      throw new Error('Need an opts object as first argument');
    }

    this._db = null;
    this._adapter = null;
    this._gfs = null;
    this._isReady = false;
    this.opts = opts;
    this._defaultRootFs = 'fs';
  }

  getDb() {
    return this._db;
  }

  getGridFS(_options) {
    const options = Object.assign({ root: this._defaultRootFs }, _options);
    return Grid(this._db, mongo, options.root);
  }

  selectAdapter(name) {
    switch (name || this.opts.adapter.name) {
      case 'native': {
        return Native;
      }

      default: {
        throw new Error(`Adapter ${this.opts.adapter} not supported`);
      }
    }
  }

  getAdapter() {
    return this._adapter;
  }

  async connect() {
    console.log(this.opts.adapter);
    this._adapter = this.selectAdapter()(this.opts.adapter);
    this._adapter.connect();
    this._db = await this._adapter.whenReady();
    this._isReady = true;
  }

  isConnected() {
    return this._isReady;
  }

}

export const GridFS = (opts) => new GridFSClass(opts);
