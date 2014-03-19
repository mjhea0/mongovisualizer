var mongoose = require('mongoose');



var databaseSchema = new mongoose.Schema({

  databaseNickName: String,
  databaseHost: String,
  databasePort: Number,
  mongodbName: String,
  collectionNames: [String]

});

var DatabaseModel = module.exports = mongoose.model('database', databaseSchema);