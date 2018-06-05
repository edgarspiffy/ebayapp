var express = require('express'),
    app     = express(),
    cheerio = require('cheerio'),
    request = require('request'),
    mongoose= require('mongoose'),
    bodyParser=require('body-parser'),
    Product=require('./models/product');

    mongoose.connect('mongodb://localhost/ebayapp');
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.static(__dirname+'/public'));
    app.set('view engine','ejs');


    app.get('/',function(req,res){
        res.redirect('/add');
    });

    app.get('/add',function(req,res){
        res.render('add');
    });


//API KEY
//2nb5kyd94fhvu2wd92ujsdrd
    app.post('/add',function(req,res){
        var sellingPrice=req.body.sellingPrice;
        var itemId=req.body.itemId;
        request('http://api.walmartlabs.com/v1/items/'+itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
            if(error || response.statusCode !==200){
                console.log('sorry this item doesn\'t exist');
                return res.redirect('/add');
            }else{
                var parsedData=JSON.parse(body);

                var name=(parsedData['name']); 
                var price=(parsedData['salePrice']); 
                var productUrl=(parsedData['productUrl']);

               
                var standardShipRate=(parsedData['standardShipRate']);
                var stock=(parsedData['stock']); 
                var availableOnline=(parsedData['availableOnline']);
                
                var tax=price *.08;
                var ebayFee=sellingPrice * .1;
                var paypalFee=(sellingPrice * .029) +.3;
                var net=sellingPrice-(ebayFee+paypalFee+price+tax+standardShipRate);
                    var itemInfo={
                        sellingPrice:sellingPrice,
                        itemId:itemId,

                        name:name,
                        price:price,
                        productUrl:productUrl,
                    
                        standardShipRate:standardShipRate,
                        stock:stock,
                        availableOnline:availableOnline,
                    
                        tax:tax,
                        ebayFee:ebayFee,
                        paypalFee:paypalFee,
                        net:net 
                    };
                    Product.create(itemInfo,function(err){
                        if(err){
                            console.log('error');
                        }else{
                            res.redirect('/add');
                        }
                    });
            }
        });
    });

    app.get('/run',function(req,res){
        Product.find({},function(err,product){
            if(err){
                console.log(err);
            }else{
                res.render('run',{product:product});
            }
        });
    });

    app.listen(3000,'127.0.0.1',function(){
        console.log('you\'re doing great keep going');
    });
