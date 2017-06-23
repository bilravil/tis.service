'use strict';

/*
	create Test table on  SQLite DB through Sequelize ORM
*/
var Sequelize = require('sequelize');
module.exports = function (engine) {
	var Test = engine.define('test', {
		uuidTest: { type: Sequelize.UUID, primaryKey: true },
		uuidPatient: { type: Sequelize.UUID },
		state: { type: Sequelize.ENUM('registered', 'finished', 'sended') },
		filename: { type: Sequelize.STRING }

	}, {
		freezeTableName: true,
		tableName: 'test',
		classMethods: {
			FindAllSend: function FindAllSend(query) {
				return new Promise(function (resolve, reject) {
					Test.findAndCountAll(query).then(function (result) {
						if (result != null) resolve({ rows: result.rows, all: result.count });else resolve([]);
					});
				});
			},
			Create: function Create(param) {
				return new Promise(function (resolve, reject) {
					Test.create(param).then(function (test) {
						resolve(test);
					}).catch(function (error) {
						reject(error);
					});
				});
			},
			Update: function Update(param) {
				return new Promise(function (resolve, reject) {
					Test.findOne({ where: { uuidTest: param.uuidTest } }).then(function (test) {
						if (test !== null) {
							test.update(param).then(function () {
								resolve(test.get());
							}).error(function (error) {
								reject(error);
							});
						} else reject({ code: 404, msg: "" });
					}).catch(function (error) {
						reject({ code: 500, msg: error });
					});
				});
			},
			Get: function Get(param) {

				if (param.uuidPatient != undefined) {
					return new Promise(function (resolve, reject) {
						Test.findOne({ where: { uuidPatient: param.uuidPatient } }).then(function (test) {
							resolve(test ? test.get() : undefined);
							return;
						});
					});
				}

				if (param.uuidTest != undefined) {
					return new Promise(function (resolve, reject) {
						Test.findOne({ where: { uuidTest: param.uuidTest } }).then(function (test) {
							resolve(test ? test.get() : undefined);
							return;
						});
					});
				}

				if (param.filename != undefined) {
					return new Promise(function (resolve, reject) {
						Test.findOne({ where: { filename: param.filename } }).then(function (test) {
							resolve(test ? test.get() : undefined);
							return;
						});
					});
				}

				var query = { raw: true /*,order:[["did","ASC"]]*/ };
				if (param.paging != undefined) {
					query.offset = param.paging.current;query.limit = param.paging.show;
				}

				return Test.FindAllSend(query);
			}

		}
	});
	return Test;
};