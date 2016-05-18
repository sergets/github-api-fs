var sinon = require('sinon'),
    GhFs = require('../ghfs'),
    request, ghFs;

var BASE_URI = 'https://api.github.com/';

describe('writeFile', function() {
    beforeEach(function() {
        request = sinon.stub(),
        ghFs = new GhFs(request, 'user/repo', 'token', 'branch');
    });

    it('should write a file properly', function() {
        request.onCall(0).resolves({ object : { sha : 'oldsha' } });
        request.onCall(1).resolves({ sha : 'newsha' });
        request.onCall(2).resolves({ sha : 'commitsha' });
        request.onCall(3).resolves({ sha : 'branchsha' });

        return ghFs.writeFile('path/file', 'file content')
            .then(function(res) {
                return ghFs.commit('commit message');
            })
            .then(function(res) {
                request.getCall(0).should.have.been.calledWith(sinon.match({
                    method : 'GET',
                    url : BASE_URI + 'repos/user/repo/git/refs/heads/branch',
                    qs : sinon.match({ access_token : 'token' })
                }));

                request.getCall(1).should.have.been.calledWith(sinon.match({
                    method : 'POST',
                    url : BASE_URI + 'repos/user/repo/git/trees',
                    body : sinon.match({
                        tree : [
                            sinon.match({
                                path : 'path/file',
                                type : 'blob',
                                mode : '100644',
                                content : 'file content'
                            })
                        ],
                        base_tree : 'oldsha'
                    })
                }));
        
                request.getCall(2).should.have.been.calledWith(sinon.match({
                    method : 'POST',
                    url : BASE_URI + 'repos/user/repo/git/commits',
                    body : sinon.match({
                        message : 'commit message',
                        tree : 'newsha',
                        parents : ['oldsha']
                    })
                }));
            });
    });

    it('should write two files in a single request', function() {
        request.onCall(0).resolves({ object : { sha : 'oldsha' } });
        request.onCall(1).resolves({ sha : 'newsha' });
        request.onCall(2).resolves({ sha : 'commitsha' });
        request.onCall(3).resolves({ sha : 'commitsha' });

        return ghFs.writeFile('path/file1', 'first content')
            .then(function(res) {
                return ghFs.writeFile('path/file2', 'second content');
            })
            .then(function(res) {
                return ghFs.commit('commit message');
            })
            .then(function() {
                request.getCall(0).should.have.been.calledWith(sinon.match({
                    method : 'GET',
                    url : BASE_URI + 'repos/user/repo/git/refs/heads/branch',
                    qs : sinon.match({ access_token : 'token' })
                }));

                request.getCall(1).should.have.been.calledWith(sinon.match({
                    method : 'POST',
                    url : BASE_URI + 'repos/user/repo/git/trees',
                    body : sinon.match({
                        tree : [
                            sinon.match({
                                path : 'path/file1',
                                type : 'blob',
                                mode : '100644',
                                content : 'first content'
                            }),
                            sinon.match({
                                path : 'path/file2',
                                type : 'blob',
                                mode : '100644',
                                content : 'second content'
                            }),
                        ],
                        base_tree : 'oldsha'
                    })
                }));
        
                request.getCall(2).should.have.been.calledWith(sinon.match({
                    method : 'POST',
                    url : BASE_URI + 'repos/user/repo/git/commits',
                    body : sinon.match({
                        message : 'commit message',
                        tree : 'newsha',
                        parents : ['oldsha']
                    })
                }));
            });
    });
});