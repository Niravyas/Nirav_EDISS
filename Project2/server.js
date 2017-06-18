const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');

app.use(session({
secret: 'project2',
saveUninitialized: true,
cookie: {maxAge: 900000},
rolling: true,
resave:true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));    

const dbconnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'EDISS'
});


// connect to database
dbconnect.connect();

// Login function
app.post('/login', function (req, res) {
    var parameters  = [req.body.username, req.body.password]
    dbconnect.query('SELECT * FROM users where username=? and  password=?', parameters, function (err, results, fields) {
        if (err) dbconnect.end;
        
        else if(!err && results.length>0){
            req.session.username = results[0].firstname;
        res.json({ 'message':'Welcome '+req.session.username });
        }
        
        else{
         res.json({ 'message': 'There seems to be an issue with the username/password combination that you entered' });
        }   
        
    });
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

app.post('/registerUser', function (req, res) {
    
    if(!(req.body.fname) || !(req.body.lname) ||!(req.body.address) || !(req.body.city) || !(req.body.state) || !(req.body.zip) || !(req.body.email)|| !(req.body.username) || !(req.body.password)){
      res.json({ 'message': 'The input you provided is not valid' });
        }
    
    else{
        dbconnect.query('SELECT * FROM users where username=?', req.body.username, function (err, results, fields) {
        if (err) dbconnect.end;
        
        else if(!err && results.length>0){
        res.json({ 'message':'The input you provided is not valid'});
        }
            
        else if(!err && 0 == results.length){
            var parameters  = [req.body.fname, req.body.lname, req.body.address, req.body.city, req.body.state, req.body.zip, req.body.email, req.body.username, req.body.password];
            
        dbconnect.query("INSERT INTO users (`firstname`, `lastname`, `address`, `city`, `state`, `zip`, `email`, `username`, `password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", parameters, function (error, results, fields) {
        if (error) throw error;
        res.json({ 'message': req.body.fname+' was registered successfully'});
    });

        }
    });
    }
});


app.post('/addProducts', function (req, res) {
    if(req.session.username == null || req.session.username === 'undefined'){
       res.json({ 'message': 'You are not currently logged in' });
        } 
    else if(isNaN(req.body.asin) || !(req.body.productName) ||!(req.body.productDescription) || !(req.body.group) ){
      res.json({ 'message': 'The input you provided is not valid' });
        }
    else{
        //check whether user is an admin
        dbconnect.query('SELECT * FROM admins where fname=?', req.session.username, function (err1, results1, fields1) {
        if (err1) dbconnect.end;
        
        else if(!err1 && results1.length>0){
           //add product if not a duplicate
            var parameters  = [req.body.asin, req.body.productName, req.body.productDescription, req.body.group]
             dbconnect.query('INSERT INTO products (`asin`, `productname`, `productdescription`, `group`) VALUES (?, ?, ?, ?)', parameters, function (err3, results3, fields3) {
                 
        if (err3){ 
            res.json({ 'message': 'The input you provided is not valid' });
            console.log(err3);
            dbconnect.end;}
        
        else{
            res.json({ 'message': req.body.productName + ' was successfully added to the system' });
         
        }   
        
    });
            
        }
        
        else{
         res.json({ 'message': 'You must be an admin to perform this action' });
        }   
        
    });
        
    }
  
});


app.post('/modifyProduct', function (req, res) {
    if(req.session.username == null || req.session.username === 'undefined'){
       res.json({ 'message': 'You are not currently logged in' });
        } 
    else if(isNaN(req.body.asin) || !(req.body.productName) ||!(req.body.productDescription) || !(req.body.group) ){
      res.json({ 'message': 'The input you provided is not valid' });
        }
    else{
        //check whether user is an admin
        dbconnect.query('SELECT * FROM admins where fname=?', req.session.username, function (err1, results1, fields1) {
        if (err1) dbconnect.end;
        
        else if(!err1 && results1.length>0){
           //add product if not a duplicate
            var parameters  = [req.body.productName, req.body.productDescription, req.body.group, req.body.asin]
             dbconnect.query('UPDATE products SET `productname`=?, `productdescription`=?, `group`=? where `asin`=?', parameters, function (err3, results3, fields3) {
                 
        if (err3){ 
            res.json({ 'message': 'The input you provided is not valid' });
            console.log(err3);
            dbconnect.end;}
        
        else{
            res.json({ 'message': req.body.productName + ' was successfully updated' });
         
        }   
        
    });
            
        }
        
        else{
         res.json({ 'message': 'You must be an admin to perform this action' });
        }   
        
    });
        
    }
  
});

 
// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(3000, function () {
    console.log('niravkav Project 2 app is running on port 3000');
});
 

module.exports = app;