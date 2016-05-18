var request = require('request-promise'),
    GhFs = require('./ghfs');

module.exports = function(repo, token, branch) {
    return new GhFs(request, repo, token, branch);
};
