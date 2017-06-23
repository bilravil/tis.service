'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
	Contains functions for work with config - read and write from WEB
*/
var fs = require('fs');

var Config = function () {
	function Config(api) {
		_classCallCheck(this, Config);

		this.api = api;
	}

	_createClass(Config, [{
		key: 'buildConfig',
		value: function buildConfig(data) {
			var json = {
				main: {
					server: data.server,
					port: data.port,
					version: data.version
				},
				easyecg: {
					easyecgsernum: data.easyecgsernum,
					easyecginputdir: data.easyecginputdir,
					easyecgoutputdir: data.easyecgoutputdir,
					easyecgpath: data.easyecgpath
				}

			};

			fs.writeFile('./config.json', JSON.stringify(json), function (err) {});
		}
	}, {
		key: 'readConfig',
		value: function readConfig() {
			return new Promise(function (resolve, reject) {
				if (!fs.existsSync('./config.json')) {
					resolve(['']);return;
				}
				fs.readFile('./config.json', 'utf8', function (err, data) {
					resolve(JSON.parse(data));
				});
			});
		}

		// this.api.GetExpress().post('/tis/writeConfig', jsonParser, function (req, res) {
		// 	if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
		// 	if (req.method === 'POST') {
		// 		buildConfig(req.body);
		// 		res.send({ success: true });
		// 		return;
		// 	}
		// })

		// this.api.GetExpress().post('/tis/readConfig', jsonParser, function (req, res) {
		// 	if (!req.body) return res.send({ success: false, message: "Invalid arguments" });
		// 	if (req.method === 'POST') {
		// 		readConfig().then(function (result) {
		// 			res.send({ success: true, msg: result });
		// 		});
		// 	}
		// })

	}]);

	return Config;
}();