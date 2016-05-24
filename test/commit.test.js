var sinon = require('sinon'),
    mockRequest = require('./mockRequest'),
    GhFs = require('../ghfs'),
    request, ghFs;

describe('commit', function() {
    beforeEach(function() {
        request = mockRequest([
            {
                call : 'GET repos/user/repo/git/refs/heads/branch',
                returns : { object : { sha : 'oldsha' } }
            },
            {
                call : 'POST repos/user/repo/git/commits',
                body : {
                    message : 'commit message',
                    author : sinon.match({
                        name : 'committer',
                        date : "2016-05-02T00:13:30+03:00"
                    }),
                    tree : 'oldsha',
                    parents : ['oldsha']
                },
                returns : { sha : 'commitsha' }
            },
            {
                call : 'POST repos/user/repo/git/refs/heads/branch',
                body : { sha : 'commitsha' },
                returns : { sha : 'branchsha' }
            }
        ]),
        ghFs = new GhFs(request, 'user/repo', 'token', 'branch');
    });

    it('should understand commit data hash', function() {
        return ghFs.commit({
            message : 'commit message',
            author : {
                name : 'committer',
                date : "2016-05-02T00:13:30+03:00"
            }
        }).then(function() {
            request.verify([0, 0, 1, 2]); // FIXME
        });
    });
});