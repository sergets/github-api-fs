var sinon = require('sinon'),
    GhFs = require('../ghfs'),
    request, ghFs;

var BASE_URI = 'https://api.github.com/';

describe('commit', function() {
    beforeEach(function() {
        request = sinon.stub(),
        ghFs = new GhFs(request, 'user/repo', 'token', 'branch');
    });

    it('should understand commit data hash', function() {
        request.onCall(0).resolves({ object : { sha : 'oldsha' } });
        request.onCall(1).resolves({ object : { sha : 'oldsha' } }); // FIXME
        request.onCall(2).resolves({ sha : 'commitsha' });
        request.onCall(3).resolves({ sha : 'branchsha' });

        return ghFs.commit({
            message : 'commit message',
            author : {
                name : 'committer',
                date : "2016-05-02T00:13:30+03:00"
            }
        }).then(function() {
            request.getCall(0).should.have.been.calledWith(sinon.match({
                method : 'GET',
                url : BASE_URI + 'repos/user/repo/git/refs/heads/branch',
                qs : sinon.match({ access_token : 'token' })
            }));

            request.getCall(2).should.have.been.calledWithMatch(sinon.match({ // FIXME
                method : 'POST',
                url : BASE_URI + 'repos/user/repo/git/commits',
                body : sinon.match({
                    message : 'commit message',
                    author : sinon.match({
                        name : 'committer',
                        date : "2016-05-02T00:13:30+03:00"
                    }),
                    tree : 'oldsha',
                    parents : ['oldsha']
                })
            }));

            request.getCall(3).should.have.been.calledWith(sinon.match({
                method : 'POST',
                url : BASE_URI + 'repos/user/repo/git/refs/heads/branch',
                body : sinon.match({
                    sha : 'commitsha'
                })
            }));
        });
    });
});