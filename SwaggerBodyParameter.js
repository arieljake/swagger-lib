const _ = require('lodash');

module.exports = class SwaggerBodyParameter {

  constructor(spec, method) {
    this.spec = spec;
    this.method = method;
  }

  get fields() {
    const fields = [];
    this.addFields(fields, this.spec.schema);
    return fields;
  }

  addFields(fields, schema, prefix = '') {
    let isArray = false;

    if (schema.type === 'array') {
      isArray = true;
      schema = schema.items;
    }

    const required = schema.required || [];
    
    Object.keys(schema.properties).forEach((paramName) => {
      const param = schema.properties[paramName];
      const fullParamName = `${prefix}${paramName}`;
      const isRequired = required.indexOf(paramName) >= 0;

      fields.push({
        name: paramName,
        fullName: fullParamName, 
        schema: param, 
        isRequired,
        isArray
      });
      
      if (param.type === 'object') {
        this.addFields(fields, param, `${fullParamName}.`);
      } else if (param.type === 'array' && param.items.type === 'object') {
        this.addFields(fields, param.items, `${fullParamName}.`);
      }
    });
  }
};