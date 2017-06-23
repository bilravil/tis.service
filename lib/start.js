'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
    this class have been called by user after appoints research from WEB . Call launcher.js methods
*/
var hide = require('node-hide');
var launcher = require('./server/launcher.js');

var Start = function () {
    function Start() {
        _classCallCheck(this, Start);
    }

    _createClass(Start, [{
        key: 'hideWindow',
        value: function hideWindow() {
            var handle = hide.findWindow('C:\\Program Files (x86)\\nodejs\\node.exe');
            hide.hideWindow(handle);
            handle = hide.findWindow('C:\\Program Files\\nodejs\\node.exe');
            hide.hideWindow(handle);
        }
    }, {
        key: 'run',
        value: function run() {
            process.argv.forEach(function (val, index, array) {
                if (index === 2) {
                    var data = new Buffer(val.substr(6), 'base64').toString('utf8');
                    //var launcher = new 
                    console.log(JSON.parse(data));
                }
            });
        }
    }]);

    return Start;
}();

var start = new Start();
start.hideWindow();
start.run();