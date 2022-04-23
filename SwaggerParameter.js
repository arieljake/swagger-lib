const _ = require('lodash');

module.exports = class SwaggerParameter {

  constructor(name, spec, file) {
    this.name = name;
    this.spec = spec;
    this.file = file;
  }

  is(name) {
    return this.name === name;
  }
};