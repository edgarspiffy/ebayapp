var express = require('express'),
    app     = express(),
    cheerio = require('cheerio'),
    request = require('request'),
    mongoose= require('mongoose'),
    bodyParser=require('body-parser'),
    methodOverride=require('method-override'),
    wipe=require('./wipe'),
    // displayRoute=require('./routes/display'),
    // productRoute=require('./routes/product'),
    activeRoute=require('./routes/active'),
    inactiveRoute=require('./routes/inactive'),
    seed=require('./seeds'),
    Product=require('./models/product');

    //mongoose.connect('mongodb://localhost/ebayapp');
    mongoose.connect('mongodb://edgar:abc123@ds259711.mlab.com:59711/ebayapp');
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.static(__dirname+'/public'));
    app.use(methodOverride('_method'));

    // app.use('/display',displayRoute);
    // app.use('/product',productRoute);
    app.use('/active',activeRoute);
    app.use('/inactive',inactiveRoute);
  
    //AUTHENTICATION ROUTE
    // passport=require('passport');
    // LocalStrategy=require('passport-local');
    // passportLocalMongoose=require('passport-local-mongoose');
    // sessions=require('express-session');

    app.set('view engine','ejs');

    // app.use(sessions({
    //     secret:'testing',
    //     resave:'false',
    //     saveUninitialized:false
    // }));

    // app.use(passport.initialize());
    // app.use(passport.session());

    // passport.use(new LocalStrategy());


    //Clear database
    //wipe();

    //Seed Data
    //seed();

app.get('https://secret-gorge-49440.herokuapp.com',function(req,res){
    res.redirect('/https://secret-gorge-49440.herokuapp.com/active');
});

//Listen to app
// app.listen(3000,'127.0.0.1',function(){
//     console.log('you\'re doing great keep going');
// });

app.listen(process.env.PORT || 5000)