var express= require('express');
var app=express();
//bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//for mongodb
const MongoClient=require('mongodb').MongoClient;

//connection server file for AWT
let server = require('./server');
let middleware = require('./middleware');


// DATABASE CONNECTION
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalManagement';
let db


MongoClient.connect(url, {useUnifiedTopology: true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
})


//FETCHING HOSPITAL DETAILS
app.get('/hospitalDetails',middleware.checkToken, function (req,res){
    console.log("Fetching data from hospital collection");
    var data = db.collection('hospital').find().toArray()
          .then(result => res.json(result));
});

//VENTILATORS DETAILS
app.get('/ventilatorDetails',middleware.checkToken,(req,res) => {
    console.log("Ventilators Information");
    var ventilatorDetails = db.collection('ventilators').find().toArray().then(result => res.json(result));
});

//SEARCH VENTILATORS BY STATUS
app.post('/searchVentilatorsByStatus',middleware.checkToken,(req,res) =>{
    var status = req.body.status;
    console.log(status);
    var ventilatorDetails = db.collection('ventilators')
    .find({"status": status}).toArray().then(result => res.json(result));

});
//SEARCH VENTILATORS BY HOSPITAL NAME
app.post('/searchVentilatorsByName',middleware.checkToken,(req,res)=>{
    var name = req.query.name;
    console.log(name);
    var ventilatorDetails = db.collection('ventilators')
    .find({"name":new RegExp(name, 'i')}).toArray().then(result => res.json(result));
});

//SEARCH HOSPITAL BY NAME
app.post('/searchHospitalByName',middleware.checkToken,(req,res)=>{
    var name = req.query.name;
    console.log(name);
    var hospitalDetails = db.collection('hospital')
    .find({ 'name': new RegExp(name, 'i')}).toArray().
    then(result => res.json(result));
});

//UPDATE VENTILATOR DETAILS
app.put('/updateVentilators',middleware.checkToken,(req,res)=>{
    var ventid = {ventilatorId : req.body.ventilatorId};
    console.log(ventid);
    var newVals = { $set: {status: req.body.status}};
    db.collection("ventilators").updateOne(ventid,newVals,function(err,result){
        res.json('1 document updated');
        if(err) throw err;
    });
});

//ADD VENTILATOR
app.post('/addVentilatorByUser',middleware.checkToken,(req,res)=>{
    var hid = req.body.hid;
    var ventilatorId = req.body.ventilatorId;
    var status = req.body.status;
    var name = req.body.name;

    var item=
    {
        hid:hid, ventilatorId:ventilatorId, status:status, name
    };
    db.collection("ventilators").insertOne(item, function(err,result){
        res.json('Item inserted');
    });
});

//DELETE VENTILATOR BY 
app.delete('/delete',middleware.checkToken,(req,res)=> {
    var myQuery = req.query.ventilatorId;
    console.log(myQuery);
    var myQuery1 = { ventilatorId: myQuery };
    db.collection('ventilators').deleteOne(myQuery1, function (err,obj)
    {
        if(err) throw err;
        res.json("1 document deleted");
    });
});

app.listen(1100);
