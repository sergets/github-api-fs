var extend = require('extend');

var BASE_URI = 'https://api.github.com/';

var GhFs = function(request, repo, token, branch) {
    this._requester = request,
    this._repo = repo,
    this._token = token,
    this._branch = branch,

    this._headSha = null;
    this._treeUpdate = [];
};

GhFs.prototype = {
    _request : function(method, apiMethod, data, queryString) {
        var params = {
            method : method.toUpperCase(),
            url : BASE_URI + 'repos/' + this._repo + '/' + apiMethod,
            qs : extend({ access_token : this._token }, queryString),
            headers : { 'User-Agent' : 'sergets/githup-api-fs' },
            json : true,
            body : data
        };

        return this._requester(params);
    },

    _getHeadSha : function() {
        return Promise.resolve(this._headSha || this._request('get', 'git/refs/heads/' + this._branch).then(function(branchHeadRef) {
            this._headSha = branchHeadRef.object.sha;
            return this._headSha;
        }.bind(this)));
    },

    _commitTreeUpdate : function() {
        return this._getHeadSha().then(function(headSha) {
            if (!this._treeUpdate.length) {
                return headSha;
            } else {
                return this._request('post', 'git/trees', {
                    tree : this._treeUpdate,
                    base_tree : headSha
                }).then(function(newTree) {
                    this._treeUpdate = [];
                    this._headSha = newTree.sha;
                    return newTree.sha;
                }.bind(this));
            }
        }.bind(this));
    },

    writeFile : function(path, data) {
        return this._getHeadSha()
            .then(function(serverSha) {
                this._treeUpdate.push({
                    path : path,
                    type : 'blob',
                    mode : '100644',
                    content : String(data)
                });
                return this;
            }.bind(this));
    },

    commit : function(params) {
        if (typeof params == 'string') {
            params = { 
                message : params
            };
        }

        return Promise.all([this._getHeadSha(), this._commitTreeUpdate()])
            .then(function(shas) {
                return this._request('post', 'git/commits', extend({
                    tree : shas[1],
                    parents : [shas[0]] 
                }, params));
            }.bind(this))
            .then(function(commit) {
                return this._request('post', 'git/refs/heads/' + this._branch, {
                    sha : commit.sha
                });
            }.bind(this));
    }
};

module.exports = GhFs;
