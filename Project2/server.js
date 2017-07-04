const express = require('express');
var redis   = require('redis');
const session = require('express-session');
var redisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
var client  = redis.createClient();
const app = express();
const mysql = require('mysql');
//const cookieParser = require('cookie-parser');
var client = redis.createClient(6379, 'redis-cluster.3cxu5o.ng.0001.use1.cache.amazonaws.com', {no_ready_check: true});


//app.use(cookieParser);
app.use(session({
secret: 'project2',
saveUninitialized: true,
store: new redisStore({ host: 'redis-cluster.3cxu5o.ng.0001.use1.cache.amazonaws.com', port: 6379, client: client,ttl :  260}),
cookie: {maxAge: 900000},
rolling: true,
resave:true }));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));    

const dbconnect = mysql.createConnection({
    host: 'mysql-instance1.cw9kedhiiosc.us-east-1.rds.amazonaws.com',
    user: 'niravyas_ediss',
    password: 'edissrox',
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
            req.session.username = req.body.username;
        res.json({ 'message':'Welcome '+results[0].fname });
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
            
        dbconnect.query("INSERT INTO users (`fname`, `lname`, `address`, `city`, `state`, `zip`, `email`, `username`, `password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", parameters, function (error, results, fields) {
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
        dbconnect.query('SELECT * FROM admins where username=?', req.session.username, function (err1, results1, fields1) {
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
        dbconnect.query('SELECT * FROM admins where username=?', req.session.username, function (err1, results1, fields1) {
        console.log("Session user:"+req.session.username);
        if (err1) dbconnect.end;
        
        else if(!err1 && results1.length>0){
           //add product if not a duplicate
            var parameters  = [req.body.productName, req.body.productDescription, req.body.group, req.body.asin]
             dbconnect.query('UPDATE products SET `productname`=?, `productdescription`=?, `group`=? where `asin`=?', parameters, function (err3, results3, fields3) {
                 
        if (err3){ 
            res.json({ 'message': 'The input you provided is not valid' });
            console.log(err3);
            dbconnect.end;
        }
        
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

app.post('/viewUsers', function (req, res) {
    if(req.session.username == null || req.session.username === 'undefined'){
       res.json({ 'message': 'You are not currently logged in' });
        } 
    else{
        //check whether user is an admin
        dbconnect.query('SELECT * FROM admins where username=?', req.session.username, function (err1, results1, fields1) {
        if (err1) dbconnect.end;
        
        else if(!err1 && results1.length>0){
          if((req.body.fname) && !(req.body.lname)){
              //search using first name
              dbconnect.query('SELECT fname, lname, username as userId FROM users where fname=?', req.body.fname, function (err2, results2, fields2) {
                    if (err2){console.log(err2); dbconnect.end;}
                    else if(results2.length == 0){
                        res.json({ 'message': 'There are no users that match that criteria' });
                    }
                    else{
                        res.json({ 'message': 'The action was successful', 'user':results2});
                    }
                     });
          }
           else if(!(req.body.fname) && (req.body.lname)){
               //searchusing last name
               
                dbconnect.query('SELECT fname, lname, username as userId FROM users where lname=?', req.body.lname, function (err2, results2, fields2) {
                    if (err2) dbconnect.end;
                    else if(results2.length == 0){
                        res.json({ 'message': 'There are no users that match that criteria' });
                    }
                    else{
                        res.json({ 'message': 'The action was successful', 'user':results2});
                    }
                     });
           }
            else if((req.body.fname) && (req.body.lname)){
                //search using both names
                var parameters = [req.body.fname, req.body.lname]
                dbconnect.query('SELECT fname, lname, username as userId  FROM users where fname=? and lname=?', parameters, function (err2, results2, fields2) {
                    if (err2) dbconnect.end;
                    else if(results2.length == 0){
                        res.json({ 'message': 'There are no users that match that criteria' });
                    }
                    else{
                        res.json({ 'message': 'The action was successful', 'user':results2});
                    }
                     });
            }
            else{
                //search using no filter
                dbconnect.query('SELECT fname, lname, username as userId FROM users', function (err3, results3, fields3) {
                    if (err3) dbconnect.end;
                    else if(results3.length == 0){
                        res.json({ 'message': 'There are no users that match that criteria' });
                    }
                    else{
                        res.json({ 'message': 'The action was successful', 'user':results3});
                    }
                     });
            }
       }
        
        else{
         res.json({ 'message': 'You must be an admin to perform this action' });
        }   
        
    });
        
    }
  
});


app.post('/viewProducts', function (req, res) {
    

        var query1 = "SELECT `asin`, `productName` from `products`"
        
        if(!req.body.asin && !req.body.keyword && !req.body.group){
            dbconnect.query(query1, function (err, results, fields) {
                    if (err) dbconnect.end;
                    else if(results.length == 0){
                        res.json({ 'message': 'There are no products that match that criteria' });
                    }
                    else{
                        res.json({ 'message': 'The action was successful', 'product':results});
                    }
                     });
        }
        
     else{   
        if(req.body.asin || req.body.keyword || req .body.group){
            query1 = query1.concat("  where");
        }
        
        if(req.body.asin){
            query1 = query1.concat("  `asin` = '");
            query1 = query1.concat(req.body.asin);
            query1 = query1.concat("' and");       
        }
   
    if(req.body.keyword){
            query1 = query1.concat(" (`productName` like '");
            query1 = query1.concat("%");
            query1 = query1.concat(req.body.keyword);
            query1 = query1.concat("%");
            query1 = query1.concat("'");
            query1 = query1.concat(" or `productDescription` like '");
            query1 = query1.concat("%");
            query1 = query1.concat(req.body.keyword);
            query1 = query1.concat("%");
            query1 = query1.concat("') and");
            
        }
    
     
    if(req.body.group){
        query1 = query1.concat(" `group`='");
        query1 = query1.concat(req.body.group);
         query1 = query1.concat("' and");
    }
    if(req.body.asin || req.body.keyword || req.body.group){
            query1 = query1.substring(0, query1.length - 3);
        }
    
    console.log(query1);
    dbconnect.query(query1, function (err, results, fields) {
                    if (err) dbconnect.end;
                    else if(results.length == 0){
                        res.json({ 'message': 'There are no products that match that criteria' });
                    }
                    else{
                        res.json({ 'message': 'The action was successful', 'product':results});
                    }
                     });
         
     }
  });

app.post('/updateInfo', function (req, res) {
    
    var admin_status = false;
    var firstName = '';
    if(req.session.username == null || req.session.username === 'undefined'){
       res.json({ 'message': 'You are not currently logged in' });
        } 
   else if(!req.body.fname && !req.body.lname && !req.body.address && !req.body.city && !req.body.state && !req.body.zip && !req.body.email && !req.body.username && !req.body.password){
        res.json({ 'message': 'The input you provided is not valid'});
    }
    
   else{ 
        var query1 = "UPDATE `users` SET";
        var admin_query = "UPDATE `admins` SET";
    
    if(req.body.fname){
        query1 = query1.concat(" `fname`='");
        query1 = query1.concat(req.body.fname);
        query1 = query1.concat("',"); 
        
        admin_query = admin_query.concat(" `fname`='");
        admin_query = admin_query.concat(req.body.fname);
        admin_query = admin_query.concat("',");
    }
    
    if(req.body.lname){
        query1 = query1.concat(" `lname`='");
        query1 = query1.concat(req.body.lname);
        query1 = query1.concat("',"); 
    }
   
    if(req.body.address){
        query1 = query1.concat(" `address`='");
        query1 = query1.concat(req.body.address);
        query1 = query1.concat("',"); 
    }
    if(req.body.city){
        query1 = query1.concat(" `city`='");
        query1 = query1.concat(req.body.city);
        query1 = query1.concat("',"); 
    }   
    
    if(req.body.state){
        query1 = query1.concat(" `state`='");
        query1 = query1.concat(req.body.state);
        query1 = query1.concat("',"); 
    } 
    
    if(req.body.zip){
        query1 = query1.concat(" `zip`='");
        query1 = query1.concat(req.body.zip);
        query1 = query1.concat("',"); 
    } 
    
    if(req.body.email){
        query1 = query1.concat(" `email`='");
        query1 = query1.concat(req.body.email);
        query1 = query1.concat("',"); 
    } 
    
    if(req.body.username){
        query1 = query1.concat(" `username`='");
        query1 = query1.concat(req.body.username);
        query1 = query1.concat("',"); 
        
        admin_query = admin_query.concat(" `username`='");
        admin_query = admin_query.concat(req.body.username);
        admin_query = admin_query.concat("',");
    } 
    
    if(req.body.password){
        query1 = query1.concat(" `password`='");
        query1 = query1.concat(req.body.password);
        query1 = query1.concat("',"); 
    }
    
   query1 =  query1.substring(0, query1.length - 1);
    
    admin_query =  admin_query.substring(0, admin_query.length - 1);
    
    query1 = query1.concat(" WHERE `username`='");
    query1 = query1.concat(req.session.username);
    query1 = query1.concat("'");
    
    admin_query = admin_query.concat(" WHERE `username`='");
    admin_query = admin_query.concat(req.session.username);
    admin_query = admin_query.concat("'");
    
   
    
   
    
    
    dbconnect.query('SELECT * FROM `admins` where `username`=?', req.session.username, function (err1, results1, fields1) {
        if (err1) dbconnect.end;
        
        else if(!err1 && results1.length>0){
            admin_status = true;
             dbconnect.query(admin_query, function (err2, results2, fields2) {
        if(err2) dbconnect.end;
        else {
           console.log("Admin updated as well!");
        }
        });
            console.log("Made admin d true"+admin_status);
        }
        });
   //changing sessions
     if(req.body.username){
        req.session.username = req.body.username;
        
    }
     
    //finally update users table
    dbconnect.query(query1, function (err1, results1, fields1) {
    if(err1){ 
        res.json({ 'message': 'The input you provided is not valid'});
        dbconnect.end;}
        else{
            console.log("Information updated");
            //code to get first name from db
    
    dbconnect.query('SELECT fname FROM `users` where `username`=?', req.session.username, function (err1, results1, fields1) {
        if (err1) dbconnect.end;
        
        else if(!err1 && results1.length>0){
            firstName = results1[0].fname;
            console.log(firstName);
            res.json({ 'message': firstName + ' your information was successfully updated'});
        }
        });
    
            
        }
        });
   }
    
  });

 
// port must 8080
app.listen(8080, function () {
    console.log('niravkav Project 2 app is running on port 8080');
});
 

module.exports = app;