# github-api-fs [![Build Status](https://travis-ci.org/sergets/github-api-fs.svg?branch=master)](https://travis-ci.org/sergets/github-api-fs)
A module to work with your repo through the [Github API](https://developer.github.com/v3/git/) with an interface more or less like node's `fs`. 

Supported methods
----

* `writeFile`

All work should be followed by `commit()` call to actually process API calls.

Example
----

````js
var ghFs = require('github-api-fs')('user/repo', 'your-oauth-key', 'master');

ghFs.writeFile('hello.txt', 'Hello world!').then(function() { 
    ghFs.commit('Added hello.txt to master branch');
});
````
