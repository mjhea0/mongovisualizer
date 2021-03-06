var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    format = require('util').format,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');
var async = require('async');
var mongoose = require('mongoose');
var DatabaseModel = require('./databaseModel.js');


// function to open and return ONE object of opened mongo db by given dbname, host and port
var openDb = function(dbname, dbhost, dbport, username, password, callback) {
  var connectionString = "mongodb://" + username + ":" + password + "@" + dbhost + ":" + dbport + "/" + dbname;
  console.log('connectionString: ',connectionString);
  Db.connect(connectionString, function(err, db) {
    assert.equal(null, err);
    callback(null, db);
  });
};

var collectionNames = function(db, callback) {
  db.collectionNames(function(err, names) {
    assert.equal(null, err);
    assert.ok(names.length > 0);
    var collectionNamesArr = names.map(function(n) {
      return n.name.slice(db.databaseName.length+1);
    });
    DatabaseModel.findOneAndUpdate(
      { mongodbName: db.databaseName },
      { collectionNames: collectionNamesArr.slice(1)},
      function(err, doc) {
        console.log("findAndUpdate doc: ", doc);
      });
    callback(null, db, collectionNamesArr);
  });
};


var collectionModel = module.exports = {

  // helper function to create an array of objects containing collection names and
  // # of documents in each collection in the activated mongoDB by active button click event
  openDb: openDb,
  collectionNames: collectionNames,

  activeDbCollections: function(dbname, dbhost, dbport, username, password, cb) {

    async.waterfall([

      function(callback) {
        openDb(dbname, dbhost, dbport, username, password, callback);
      },

      collectionNames,

      function(db, names, callback) {
        var nameCountFunctions = names.slice(1).map(function(name) {
          return function(cb) {
            db.collection(name).count(function(err, count) {
              assert.equal(null, err);
              var obj = {};
              obj[name] = count;
              cb(null, obj);
              // obj[stats.ns.slice(dbname.length+1)] = stats.count;
              // console.log('nameCount: ', obj);
            });
          };
        });
        async.parallel(nameCountFunctions, function(err, results) {
          callback(null, db, results);
        });
      },

      function(db, nameCount, callback) {
        db.close();
        callback(null, nameCount);
      }
    ], function(err, result) {
      cb(result);
    });
  }
};
