module.exports = function defineMethod(cls, methodName, promiseFunc) {
    if (typeof methodName == 'object') {
        Object.keys(methodName).forEach(function(eachMethodName) {
            defineMethod(cls, eachMethodName, methodName[eachMethodName]);
        });
    }

    cls.prototype[methodName] = function() {
        var callback = arguments[arguments.length - 1];
        if (typeof callback == 'function') {
            return promiseFunc.apply(this, [].slice.call(arguments, 0, arguments.length - 1)).then(
                function(res) {
                    callback(undefined, res);
                },
                function(err) {
                    callback(err);
                }
            );
        } else {
            return promiseFunc.apply(this, arguments);
        }
    };
};