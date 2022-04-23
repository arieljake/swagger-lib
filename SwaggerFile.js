const _ = require('lodash');
const traverse = require('traverse');
const SwaggerDefinition = require('./SwaggerDefinition');
const SwaggerParameter = require('./SwaggerParameter');
const SwaggerPath = require('./SwaggerPath');
const SwaggerResponse = require('./SwaggerResponse');
const SwaggerFileMerger = require('./SwaggerFileMerger');

module.exports = class SwaggerFile {

  constructor(spec) {
    this.spec = spec;

    this.paths = _.flatten(Object.keys(this.spec.paths).map(p => new SwaggerPath(p, this.spec.paths[p], this)));
    this.definitions = _.flatten(Object.keys(this.spec.definitions).map(d => new SwaggerDefinition(d, this.spec.definitions[d], this)));
    this.responses = _.flatten(Object.keys(this.spec.responses).map(r => new SwaggerResponse(r, this.spec.responses[r], this)));
    this.parameters = _.flatten(Object.keys(this.spec.parameters).map(p => new SwaggerParameter(p, this.spec.parameters[p], this)));
  }

  get methods() {
    return _.flatten(this.paths.map(p => p.methods));
  }

  get tags() {
    return _.uniq(_.flatten(this.paths.map(p => p.tags)));
  }

  get host() {
    return this.spec.host;
  }

  get basePath() {
    return this.spec.basePath;
  }

  getMethod(method, path) {
    return this.methods.find(m => m.is(method, path));
  }

  getMethodsForTag(tag) {
    return this.methods.filter(m => m.tags.indexOf(tag) >= 0);
  }

  deRef(schema, debug = false) {
    const dupSchema = _.cloneDeep({ root: schema });
    const getRef = this.getRef.bind(this);

    traverse(dupSchema).forEach(function(node) {
      if (node && node.$ref) {
        this.update(getRef(node.$ref));
      }
    });

    return dupSchema.root;
  }

  getRef(ref) {
    const refParts = ref.split('/');
    const refType = refParts[1];
    const refId = refParts[2];
    
    if (!this[refType]) {
      return null;
    }
    
    return this[refType].find(r => r.is(refId)).spec;
  }

  sampleSchema(schema) {
    const dupSchema = _.cloneDeep(schema);
    const sampleSchema = this.sampleSchema.bind(this);
    
    return traverse(dupSchema).forEach(function(d) {
      if (this.node._hidden === 'TRUE') {
        this.remove(true);
      }
      else if (this.node.type === 'object') {
        if (this.node.properties !== undefined) {
          this.update(sampleSchema(this.node.properties));
        } else {
          this.update({}, true);
        }
      } else if (this.node.type === 'string') {
        if (this.node.default) {
          this.update(this.node.default, true);
        } else if (this.node.enum && this.node.enum.length) {
          this.update(this.node.enum[0], true);
        } else {
          this.update('', true);
        }
      } else if (this.node.type === 'boolean') {
        this.update((this.default !== undefined ? this.default : true), true);
      } else if (this.node.type === 'integer' || this.node.type === 'number') {
        this.update(this.node.default ? parseInt(this.node.default, 10) : 10, true);
      } else if (this.node.type === 'array') {
        this.update([sampleSchema(this.node.items)]);
      }
    });
  }

  overrideSpec(values) {
    Object.assign(this.spec, values);
  }

  merge(file) {
    SwaggerFileMerger.merge(this, file); 
  }
};