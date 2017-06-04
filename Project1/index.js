
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');

app.use(session({
secret: 'random',
saveUninitialized: true,
cookie: {maxAge: 60000},
rolling: true,
resave:true }));
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
 
// connection configurations
const dbconnect = mysql.createConnection({
    host: 'east1-mysql-instance1.cw9kedhiiosc.us-east-1.rds.amazonaws.com',
    user: 'niravyas_ediss',
    password: 'edissrox',
    database: 'EDISS'
});
 
// connect to database
dbconnect.connect();
 
// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});
 
// Login function
app.post('/login', function (req, res) {
    var parameters  = [req.body.username, req.body.password]
    dbconnect.query('SELECT * FROM users where username=? and  password=?', parameters, function (err, results, fields) {
        if (err) dbconnect.end;
        
        else if(!err && results.length>0){
            req.session.username = results[0].firstname;
        res.json({ 'message': 'Welcome  '+req.session.username });
        }
        
        else{
         res.json({ 'message': 'There seems to be an issue with the username/password combination that you entered' });
        }   
        
    });
});


//Add funticon
app.post('/add', function (req, res) {
    
    if(req.session.username == null || req.session.username === 'undefined'){
       res.json({ 'message': 'You are not currently logged in' });
        } 
   else if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2)){
      res.json({ 'message': 'The numbers you entered are not valid' });
        }
    else{
        var result = Number(req.body.num1)+Number(req.body.num2)
        res.json({'message': 'The action was successful', 'result': result});
        }
});

//Multiply funticon
app.post('/multiply', function (req, res) {
    
    if(req.session.username == null || req.session.username === 'undefined'){
       res.json({ 'message': 'You are not currently logged in' });
        } 
   else if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2)){
      res.json({ 'message': 'The numbers you entered are not valid' });
        }
    else{
        var result = Number(req.body.num1)*Number(req.body.num2)
        res.json({  'message': 'The action was successful', 'result': result});
        }
});
 
//Divide funticon
app.post('/divide', function (req, res) {
    
    if(req.session.username == null || req.session.username === 'undefined'){
       res.json({ 'message': 'You are not currently logged in' });
        } 
   else if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2) || 0 == Number(req.body.num2)){
      res.json({ 'message': 'The numbers you entered are not valid' });
        }
    else{
        var result = Number(req.body.num1)/Number(req.body.num2)
        res.json({ 'message': 'The action was successful', 'result': result });
        }
});

// Logout function
app.post('/logout', function (req, res) {
    if(req.session.username == null || req.session.username === 'undefined'){
       res.json({ 'message': 'You are not currently logged in' });
        } 
    
    else{
        res.json({ 'message': 'You have been successfully logged out' });
        req.session.destroy();
    }
    
});
 
 
// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(3000, function () {
    console.log('niravkav Project 1 app is running on port 3000');
});
 

module.exports = app;
