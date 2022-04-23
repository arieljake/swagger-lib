const _ = require('lodash');

const SwaggerBodyParameter = require('./SwaggerBodyParameter');
const SwaggerResponse = require('./SwaggerResponse');

module.exports = class SwaggerMethod {

  constructor(method, spec, path) {
    this.method = method;
    this.spec = spec;
    this.path = path;
    this.strings = {};
  }

  get tags() {
    return this.spec.tags;
  }

  get operationId() {
    return this.strings.operationId || this.spec.operationId;
  }

  get summary() {
    return this.strings.summary || this.spec.summary;
  }

  get description() {
    return this.strings.description || this.spec.description;
  }

  get parameters() {
    return this.spec.parameters || [];
  }

  get allParameters() {
    return this.parameters.concat(this.path.parameters).map((p) => {
      return this.path.file.deRef(p);
    });
  }

  get parameterTypes() {
    return _.uniq(_.compact(this.allParameters.map(p => p.in)));
  }

  get headers() {
    return this.allParameters.filter(p => p.in === 'header');
  }

  get pathParameters() {
    return _.sortBy(this.allParameters.filter(p => p.in === 'path'), (p) => {
      return this.path.path.indexOf(`{${p.name}}`);
    });
  }

  get queryParameters() {
    return this.allParameters.filter(p => p.in === 'query');
  }

  get formDataParameters() {
    return this.allParameters.filter(p => p.in === 'formData');
  }

  get bodyParameter() {
    const bodyParam = this.allParameters.find(p => p.in === 'body');

    if (!bodyParam) {
      return null;
    }

    return this.path.file.deRef(bodyParam);
  }

  get bodyParameterFields() {
    const bodyParam = this.bodyParameter;

    if (!bodyParam) {
      return [];
    }

    return new SwaggerBodyParameter(bodyParam, this).fields;
  }

  get bodyParameterSample() {
    const bodyParam = this.bodyParameter;

    if (!bodyParam) {
      return null;
    }

    return this.path.file.sampleSchema(bodyParam.schema);
  }

  get bodyParameterSampleString() {
    const sample = this.bodyParameterSample;

    if (!sample) {
      return null;
    }

    return JSON.stringify(sample, null, '  ');
  }

  get consumes() {
    if (this.hasBodyParameter()) {
      return 'application/json';
    }
    else if (this.hasFormDataParameter()) {
      return 'multipart/form-data';
    }

    return null;
  }

  get successResponse() {
    const responseCode = Object.keys(this.spec.responses).find(r => r.startsWith('2'));

    if (!responseCode) {
      return null;
    }

    return new SwaggerResponse(responseCode, this.spec.responses[responseCode], this.path.file);
  }

  get errorResponses() {
    const errorResponseCodes = Object.keys(this.spec.responses).filter(r => r.startsWith('2') === false);

    return errorResponseCodes.map(r => new SwaggerResponse(r, this.spec.responses[r], this.path.file));
  }

  get methodSignature() {
    let methodSignature = [];

    this.pathParameters.forEach((p) => {
      methodSignature.push(p.name);
    });

    if (this.hasBodyParameter()) {
      methodSignature.push('body');
    } else if (this.hasFormDataParameter()) {
      methodSignature.push('formData');
    }

    if (this.hasQueryParameter()) {
      methodSignature.push('[query]');
    }

    methodSignature.push('[callback]');

    return methodSignature;
  }

  is(method, path) {
    return this.method.toLowerCase() === method.toLowerCase() && this.path.path === path;
  }

  setStrings(strings) {
    this.strings = strings;
  }

  hasBodyParameter() {
    return this.allParameters.find(p => p.in === 'body');
  }

  hasFormDataParameter() {
    return this.allParameters.find(p => p.in === 'formData');
  }

  hasQueryParameter() {
    return this.allParameters.find(p => p.in === 'query');
  }
};