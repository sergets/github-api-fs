var sinon = require('sinon'),
    GhFs = require('../ghfs'),
    mockRequest = require('./mockRequest');

var oneFileRequestPlan = [
        {
            call : 'GET repos/user/repo/git/refs/heads/branch',
            returns : { object : { sha : 'oldsha' } }
        },
        {
            call : 'POST repos/user/repo/git/trees',
            body : {
                tree : [
                    sinon.match({
                        path : 'path/file',
                        type : 'blob',
                        mode : '100644',
                        content : 'file content'
                    })
                ],
                base_tree : 'oldsha'
            },
            returns : { sha : 'newsha' }
        },
        {
            call : 'POST repos/user/repo/git/commits',
            body : {
                message : 'commit message',
                tree : 'newsha',
                parents : ['oldsha']
            },
            returns : { sha : 'commitsha' }
        },
        {
            call : 'POST repos/user/repo/git/refs/heads/branch',
            body : { sha : 'commitsha' },
            returns : { object : { sha : 'branchsha' } }
        }
    ],
    twoFilesRequestPlan = [
        {
            call : 'GET repos/user/repo/git/refs/heads/branch',
            returns : { object : { sha : 'oldsha' } }
        },
        {
            call : 'POST repos/user/repo/git/trees',
            body : {
                tree : [
                    sinon.match({
                        path : 'path/file1',
                        content : 'first content'
                    }),
                    sinon.match({
                        path : 'path/file2',
                        content : 'second content'
                    }),

                ],
                base_tree : 'oldsha'
            },
            returns : { sha : 'newsha' }
        },
        {
            call : 'POST repos/user/repo/git/commits',
            body : {
                message : 'commit message',
                tree : 'newsha',
                parents : ['oldsha']
            },
            returns : { sha : 'commitsha' }
        },
        {
            call : 'POST repos/user/repo/git/refs/heads/branch',
            body : { sha : 'commitsha' },
            returns : { object : { sha : 'branchsha' } }
        }
    ];

describe('writeFile', function() {
    it('should write a file properly', function() {
        var request = mockRequest(oneFileRequestPlan),
            ghFs = new GhFs(request, 'user/repo', 'token', 'branch');
    
        return ghFs.writeFile('path/file', 'file content')
            .then(function(res) {
                return ghFs.commit('commit message');
            })
            .then(function(res) {
                request.verify();
            });
    });

    it('should understand nodejs-like form', function(done) {
        var request = mockRequest(oneFileRequestPlan),
            ghFs = new GhFs(request, 'user/repo', 'token', 'branch');

        ghFs.writeFile('path/file', 'file content', function(err, res) {
            err && done(err);
            ghFs.commit('commit message', function(err, res) {
                err && done(err);
                request.verify();
                done();
            });
        });
    });

    it('should write two files in a single request', function() {
        var request = mockRequest(twoFilesRequestPlan),
            ghFs = new GhFs(request, 'user/repo', 'token', 'branch');    

        return ghFs.writeFile('path/file1', 'first content')
            .then(function() {
                return ghFs.writeFile('path/file2', 'second content');
            })
            .then(function() {
                return ghFs.commit('commit message');
            })
            .then(function() {
                request.verify();
            });
    });
});