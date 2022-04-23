const _ = require('lodash');

module.exports = class SwaggerFileMerger {

  static merge(file1, file2) {
    SwaggerFileMerger.mergePaths(file1, file2);
    SwaggerFileMerger.mergeDefinitions(file1, file2);
    SwaggerFileMerger.mergeParameters(file1, file2);
    SwaggerFileMerger.mergeResponses(file1, file2);
  }

  static mergePaths(file1, file2) {
    
  }

  static mergeDefinitions(file1, file2) {
    
  }

  static mergeParameters(file1, file2) {
    
  }

  static mergeResponses(file1, file2) {
    const file1Responses = [...file1.responses];

    file2.responses.forEach((r2) => {
      const r1 = file1Responses.find(r => r.is(r2.code));

      if (!r1) {
        file1.responses.push(r2);
      }
      else {
        console.log(_.isEqual(r1.spec, r2.spec));
      }
    });
  }
};