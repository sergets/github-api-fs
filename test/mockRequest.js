var sinon = require('sinon');

var BASE_URI = 'https://api.github.com/';

module.exports = function(plan) {
    var request = sinon.stub();

    plan.forEach(function(call) {
        request.withArgs(sinon.match({
            method : call.call.split(' ')[0],
            url : BASE_URI + call.call.split(' ')[1],
            body : sinon.match(call.body)
        })).resolves(call.returns);
    });
    
    request.verify = function(callNums) {
        (callNums || Array.apply([], Array(plan.length)).map(function(_, i) { return i; })).forEach(function(i, callNum) {
            request.getCall(callNum).should.have.been.calledWith(sinon.match({
                method : plan[i].call.split(' ')[0],
                url : BASE_URI + plan[i].call.split(' ')[1],
                body : sinon.match(plan[i].body)
            }));
        });
    };
    
    return request;
}