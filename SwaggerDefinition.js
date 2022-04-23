const _ = require('lodash');

module.exports = class SwaggerDefinition {

  constructor(id, spec, file) {
    this.id = id;
    this.spec = spec;
    this.file = file;
  }

  is(id) {
    return this.id === id;
  }
};