var express = require('express');
var router=express.Router();
var Product=require('../models/product');
var request = require('request');
var cheerio = require('cheerio');

//ADDITIONAL PRODUCT INFORMATION PAGE
router.get('/:id',function(req,res){
    Product.findById(req.params.id,function(err,product){
        if(err){
            console.log(err);
            console.log('sorry could not retrieve additional product informoation');
        }else{
            res.render('product',{product:product});
        }
    });
});
//EDIT SELLING PRICE FROM PRODUCT PAGE
router.put('/:id',function(req,res){
    Product.findByIdAndUpdate(req.params.id,req.body.sellingPrice,function(err,product){
        if(err){
            console.log(err);
        }else{
            console.log(product);
            product.sellingPrice=req.body.sellingPrice;
            request('http://api.walmartlabs.com/v1/items/'+product.itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
                var parsedData=JSON.parse(body);
                product.name=(parsedData['name']); 
                product.price=(parsedData['salePrice']); 
                product.productUrl=(parsedData['productUrl']);
                product.upc =(parsedData['upc']);

              
                product.standardShipRate=(parsedData['standardShipRate']);
                product.stock=(parsedData['stock']); 
                product.availableOnline=(parsedData['availableOnline']);
               
                product.tax=product.price *.08;
                product.ebayFee=product.sellingPrice * .1;
                product.paypalFee=(product.sellingPrice * .029) +.3;
                product.net=product.sellingPrice-(product.ebayFee+product.paypalFee+product.price+product.tax+product.standardShipRate);
                product.save(function(err,data){
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect('/product/'+req.params.id);
                    }
                });
            });
        }
    });
});

module.exports=router;