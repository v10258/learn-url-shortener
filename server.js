const url = require('url');
const path = require('path');
const crypto = require('crypto');

const mongo = require('mongodb').MongoClient
const dburl = 'mongodb://localhost:27017/learn';
var coll;

var express = require('express');
var app = express();

mongo.connect(dburl, function(err, conn) {
    if (err) console.log(err);
    
    console.log('connect success', conn);
    coll = conn.collection('url_shortener');
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');

const host = 'https://node-practice-v10258.c9users.io';

var urlRegexp = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

var TodoList = {
    getHash: function(){
        var hashString = crypto.createHash('sha256').update(new Date().toDateString()+ Math.random()).digest('hex').slice(0,10);
        
        return hashString;
    }
}

app.get('/', (req, res)=>{
    var url = req.query.q;
    
    if (!url||urlRegexp.test(url)) {
        res.render('index');
    } else {
        coll.findOne({
            goal: url
        }).then((doc)=>{
            var goal;
            if (doc) {
                goal = '/' + doc.sid;
                res.send('<a href="'+ goal +'">点击短链接:'+ goal +'</a>');
            } else {
                var sid = TodoList.getHash();
                coll.insert({
                    sid: sid,
                    goal: url
                }).then((result)=>{
                    goal = '/' + sid;
                    res.send('<a href="'+ goal +'">点击短链接'+ goal +'</a>');
                })
            }
        })
    }
});

app.get('/:sid', (req, res)=>{
    var sid = req.params.sid;
    
    coll.findOne({
        sid: sid
    }).then((doc)=>{
        if(doc){
            res.redirect('http://' + doc.goal);
        } else {
            res.send('404');
        }
    });
});

app.listen(process.env.PORT || 5000);