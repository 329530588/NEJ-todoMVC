const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const assert = require('assert');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const path = require('path');

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'todo';
let db;

// 静态资源目录配置
app.use(express.static('public'));
// http json处理
app.use(bodyParser.json());
// 跨域设置
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

// home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname ,'index.html'));
});

// get todos
app.get('/api/todos/:filter?', (req, res) => {
    let query, filter = req.params.filter;
    if(filter && filter !== 'all') {
        query = {
            'status': filter
        }
    } else {
        query = {}
    }
    db.collection('todo').find(query).toArray((err, result) => {
        res.send(JSON.stringify(result));
    });
});
// new todos
app.post('/api/todos/', (req, res) => {
    let payload = req.body;
    try {
        db.collection('todo').insertOne(payload, (err, result) => {
            res.send({ 'status': 'ok', '_id': result.insertedId });
        });
    } catch (e) {
        res.status(500).send({ 'error': '' + e });
    }
});
// modify todos
app.patch('/api/todos/:id', (req, res) => {
    console.log('修改：', req.params.id);
    let query = { '_id': new mongodb.ObjectId(req.params.id) };
    db.collection('todo').findOne(query, (err, result) => {
        if (err) {
            res.status(500).send({ error: '' + err });
            return;
        }
        console.log(result);
        let updateStatus = result.status === 'active' ? result.status = 'completed' : result.status = 'active';
        db.collection('todo').updateOne(query, { $set: { status: updateStatus } }, (err, result) => {
            if (err) {
                res.status(500).send({ error: '' + err });
                return;
            }
            res.send({ 'status': 'ok' });
        });

    });
});
// delete todos
app.delete('/api/todos/:id', (req, res) => {
    console.log('删除：', req.params.id);
    db.collection('todo').deleteOne({ '_id': new mongodb.ObjectId(req.params.id) }, (err, result) => {
        if (err) {
            res.status(500).send({ error: '' + err });
            return;
        }
        console.log(result.result.n + " 条文档被删除");
        res.send({ 'status': 'ok' });
    });
});

// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("connect to mongo...");
    db = client.db(dbName);
    app.listen(3000, '0.0.0.0');
});
