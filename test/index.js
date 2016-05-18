var chai = require('chai');

chai.should();
chai.use(require('sinon-chai'));
require('sinon-as-promised');

describe('github-api-fs', function() {
    [
        'writeFile',
        'commit'
    ].forEach(function(methodName) {
        require('./' + methodName + '.test');
    });
})
