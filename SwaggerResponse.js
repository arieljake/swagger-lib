const _ = require('lodash');

module.exports = class SwaggerResponse {

  constructor(code, spec, file) {
    this.code = code;
    this.spec = spec;
    this.file = file;
  }

  get description() {
    return this.spec.description;
  }

  get fullSchema() {
    return this.file.deRef(this.spec);
  }

  get sample() {
    const fullSchema = this.fullSchema;

    if (fullSchema.schema) {
      return this.file.sampleSchema(fullSchema.schema);
    }
    else if (fullSchema.properties) {
      return this.file.sampleSchema(fullSchema.properties);
    }
    
    return null;
  }

  get sampleString() {
    return JSON.stringify(this.sample, null, '  ');
  }

  is(code) {
    return this.code === code;
  }
};