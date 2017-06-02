var Sequelize = require('sequelize');
module.exports = function(engine){
	var Test = engine.define('test', {
	    uuidTest: { type: Sequelize.UUID,primaryKey: true, },
	    uuidPatient: { type: Sequelize.UUID },
	    state: { type: Sequelize.ENUM('registered','finished','sended') },
	    filename: {type: Sequelize.STRING }

	},
		{
		    freezeTableName: true,
		    tableName: 'test',
		    classMethods: {
		        FindAllSend: function(query) {
	                return new Promise( (resolve,reject) =>{
	                    Test.findAndCountAll(query).then( result => {
	                        if (result != null) resolve({ rows: result.rows, all: result.count });
	                        else resolve([]);
	                    });
	                });             
	            },
		        Create: function(param) {
	                return new Promise( (resolve,reject) =>{
	                    Test.create(param).then( test=> { resolve(test); })
	                      .catch(function (error){ reject(error); });
	                })
	            },
	            Update: function(param) {
	                return new Promise( (resolve,reject) =>{
	                    Test.findOne({ where : { uuidTest : param.uuidTest}}).then(test=> {
	                        if(test !== null){
	                            test.update(param).
	                            	then(function () { resolve(test.get()); }).
	                            	error(function (error) { reject(error); });
	                        }else  reject( { code : 404 , msg : "" });                      
	                      })
	                      .catch(function (error){
	                        reject({ code : 500 , msg : error });
	                      });
	                })
	            },
		        Get: function (param) {

		            if (param.uuidPatient != undefined ) {
	                    return new Promise( (resolve,reject) =>{
	                        Test.findOne({ where: { uuidPatient: param.uuidPatient } }).then( test => { 
	                            resolve(test ? test.get() : undefined);
	                            return;
	                        })              
	                    });
	                }

	                if (param.uuidTest != undefined ) {
	                    return new Promise( (resolve,reject) =>{
	                        Test.findOne({ where: { uuidTest: param.uuidTest } }).then( test => { 
	                            resolve(test ? test.get() : undefined);
	                            return;
	                        })              
	                    });
	                }

	                if (param.filename != undefined ) {
	                    return new Promise( (resolve,reject) =>{
	                        Test.findOne({ where: { filename: param.filename } }).then( test => { 
	                            resolve(test ? test.get() : undefined);
	                            return;
	                        })              
	                    });
	                }

		            var query = { raw: true/*,order:[["did","ASC"]]*/ };
		            if (param.paging != undefined) { query.offset = param.paging.current; query.limit = param.paging.show; }
		            	            

		            return Test.FindAllSend(query);
		        },

		    }
		});
	return Test;
}