const _ = require('lodash');
const SwaggerMethod = require('./SwaggerMethod');

const METHOD_TYPES = ['delete', 'get', 'patch', 'post', 'put'];

module.exports = class SwaggerPath {

  constructor(path, spec, file) {
    this.path = path;
    this.spec = spec;
    this.file = file;
  }

  get methodTypes() {
    return Object.keys(this.spec).filter(k => METHOD_TYPES.indexOf(k) >= 0);
  }

  get methods() {
    if (!this._methods) {
      this._methods = this.methodTypes.map(t => new SwaggerMethod(t, this.spec[t], this));
    }

    return this._methods;
  }

  get tags() {
    return _.flatten(this.methods.map(m => m.tags));
  }

  get parameters() {
    return this.spec.parameters || [];
  }
};