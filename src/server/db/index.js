/*
	Define connection to DB and init Test table from test.js
*/
'use strict';

var db = {};
exports.GetDB = function () {
	return db;
};
exports.Run = function (api, callback) {
	var Sequelize = require('sequelize');

	var engine = new Sequelize('database', 'username', 'password', {
		host: 'localhost',
		dialect: 'sqlite',
		storage: "./data.db",
		logging: false
	});
	db.test = require("./test.js")(engine);

	engine.sync();

	callback = callback || function () {};
	callback("DB service started");
};