const { ObjectId } = require('bson');
const express = require('express');
const router = express.Router();
const moment = require('moment');

module.exports = (db) => {

  // ROUTER GET DATA (VIEW)
  router.get('/', async (req, res) => {
    try {
      const url = req.url == '/' ? '/?page=1&sortBy=string&sortMode=asc' : req.url;
      const page = req.query.page || 1;
      const limit = 3;
      const offset = (page - 1) * limit;
      const wheres = {}
      const filter = `&idCheck=${req.query.idCheck}&id=${req.query.id}&stringCheck=${req.query.stringCheck}&string=${req.query.string}&integerCheck=${req.query.integerCheck}&integer=${req.query.integer}&floatCheck=${req.query.floatCheck}&float=${req.query.float}&dateCheck=${req.query.dateCheck}&startDate=${req.query.startDate}&endDate=${req.query.endDate}&booleanCheck=${req.query.booleanCheck}&boolean=${req.query.boolean}`

      var sortBy = req.query.sortBy == undefined ? 'string' : req.query.sortBy;
      var sortMode = req.query.sortMode == undefined ? 1 : req.query.sortMode;

      var sortMongo = JSON.parse(`{"${sortBy}" : ${sortMode}}`);

      if (req.query.string && req.query.stringCheck == 'on') {
        wheres["string"] = new RegExp(`${req.query.string}`, 'i')
      }

      if (req.query.integer && req.query.integerCheck == 'on') {
        wheres['integer'] = parseInt(req.query.integer)
      }

      if (req.query.float && req.query.floatCheck == 'on') {
        wheres['float'] = JSON.parse(req.query.float)
      }

      if (req.query.dateCheck == 'on') {
        if (req.query.startDate != '' && req.query.endDate != '') {
          wheres['date'] = { $gte: new Date(`${req.query.startDate}`), $lte: new Date(`${req.query.endDate}`) }

        } else if (req.query.startDate) {
          wheres['date'] = { $gte: new Date(`${req.query.startDate}`) }

        } else if (req.query.endDate) {
          wheres['date'] = { $lte: new Date(`${req.query.endDate}`) }
        }
      }

      if (req.query.boolean && req.query.booleanCheck == 'on') {
        wheres['boolean'] = JSON.parse(req.query.boolean)
      }


      const result = await db.collection("dataBread").find(wheres).toArray()

      var total = result.length;
      const pages = Math.ceil(total / limit)

      const data = await db.collection("dataBread").find(wheres).skip(offset).limit(limit).collation({ 'locale': 'en' }).sort(sortMongo).toArray()

      res.render('users/list', { data, pages, page, filter, query: req.query, sortBy, sortMode, moment, url })
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  });

  // ROUTER ADD
  router.get('/add', (req, res) => {
    res.render('users/add')
  })

  router.post('/add', async (req, res) => {
    try {
      const { string, integer, float, date, boolean } = req.body

      let Obj = {
        string: string,
        integer: Number(integer),
        float: parseFloat(float),
        date: date,
        boolean: JSON.parse(boolean)
      }

      const addData = await db.collection("dataBread").insertOne(Obj)

      res.redirect('/')
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })

  // ROUTER EDIT
  router.get('/edit/:id', async (req, res) => {
    try {
      const result = await db.collection("dataBread").findOne({ "_id": ObjectId(`${req.params.id}`) })

      res.render('users/edit', { item: result, moment })

    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })

  router.post('/edit/:id', async (req, res) => {
    try {
      const { string, integer, float, date, boolean } = req.body

      let Obj = {
        string: string,
        integer: Number(integer),
        float: parseFloat(float),
        date: date,
        boolean: JSON.parse(boolean)
      }

      const updateData = await db.collection("dataBread").updateOne({ "_id": ObjectId(`${req.params.id}`) }, { $set: Obj })

      res.redirect('/')

    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })

  // ROUTER DELETE
  router.get('/delete/:id', async (req, res) => {
    try {
      const deleteData = await db.collection("dataBread").deleteOne({ "_id": ObjectId(`${req.params.id}`) })

      res.redirect('/')
    } catch (err) {
      console.log(err)
      res.send(err)
    }

  });

  return router;
};