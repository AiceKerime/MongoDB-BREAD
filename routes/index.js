const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb')

const url = 'mongodb://localhost:27017'
const dbName = 'users'
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect((error, client) => {
  if (error) {
    return console.log('Failed to connect!')
  }

  const db = client.db(dbName)

  db.collection('dataBread').insertOne({
    string: 'Coba Lagi',
    integer: 99,
    float: 100.405,
    date: new Date('2017-11-20'),
    boolean: false
  }, (error, result) => {
    if (error) {
      console.error(error)
    }
    console.log(result)
  })
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('users/list', { title: 'Express' });
});

module.exports = router;
