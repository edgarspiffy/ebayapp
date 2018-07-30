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

    mongoose.connect('mongodb://localhost/ebayapp');
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.static(__dirname+'/public'));
    app.use(methodOverride('_method'));

    // app.use('/display',displayRoute);
    // app.use('/product',productRoute);
    app.use('/active',activeRoute);
    app.use('/inactive',inactiveRoute);
  

    app.set('view engine','ejs');


    //Clear database
    //wipe();

    //Seed Data
    //seed();

    






//Listen to app
app.listen(3000,'127.0.0.1',function(){
    console.log('you\'re doing great keep going');
});