var express = require('express');
var router=express.Router();
var Product=require('../models/product');
var request = require('request');
var cheerio = require('cheerio');

//DISPLAY DATA
router.get('/',function(req,res){
    Product.find({},function(err,product){
        if(err){
            console.log(err);
            console.log('sorry data could not be pulled from database');
        }else{
            res.render('display',{product:product});
        }
    });
});
//ADD PRODUCT TO DATABASE
router.post('/',function(req,res){
    //Collects selling price and item id
    var sellingPrice=req.body.sellingPrice;
    var itemId=req.body.itemId;
    if(!sellingPrice.length){
        sellingPrice=0;
    }
    //API Key Request for information
    request('http://api.walmartlabs.com/v1/items/'+itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
        //Handle Error
        if(error || response.statusCode !==200){
            console.log('sorry API request failed for item '+itemId+' due to');
            console.log(error);
            return res.redirect('/display');
        }else{
            //Parsed the JSON Data
            var parsedData=JSON.parse(body);
            //Assigned variables to collected data
            var name=(parsedData['name']); 
            var price=(parsedData['salePrice']); 
            var productUrl=(parsedData['productUrl']);
            var upc =(parsedData['upc']);
            //Availability Information
            var standardShipRate=(parsedData['standardShipRate']);
            var stock=(parsedData['stock']); 
            var availableOnline=(parsedData['availableOnline']);
            //Additional Product Information
            var categoryPath=(parsedData['categoryPath']);
            var shortDescription=(parsedData['shortDescription']);
            var longDescription=(parsedData['longDescription']);
            var brandName=(parsedData['brandName']);
            var modelNumber=(parsedData['modelNumber']);
            //Pictures
            var allImages=(parsedData['imageEntities']);
            //Arithmathic logic for Fees   
            var tax=price *.08;
            var ebayFee=sellingPrice * .1;
            var paypalFee=(sellingPrice * .029) +.3;
            var net=sellingPrice-(ebayFee+paypalFee+price+tax+standardShipRate);
                //Create object variable containing all collected data
                var itemInfo={
                    sellingPrice:sellingPrice,
                    itemId:itemId,
                    name:name,
                    price:price,
                    productUrl:productUrl,
                    upc:upc,
                    standardShipRate:standardShipRate,
                    stock:stock,
                    availableOnline:availableOnline,
                    categoryPath:categoryPath,
                    shortDescription:shortDescription,
                    longDescription:longDescription,
                    brandName:brandName,
                    modelNumber:modelNumber,
                    allImages:allImages,
                    tax:tax,
                    ebayFee:ebayFee,
                    paypalFee:paypalFee,
                    net:net,
                };
                //Create that object in database
                Product.create(itemInfo,function(err){
                    if(err){
                        console.log('The following product was not able to be saved '+itemId+' due to the');
                        console.log(err);
                    }else{
                        res.redirect('/display'); 
                    }
                });
        }
    });
});

//UPDATE SELLING PRICE 
router.put('/:id',function(req,res){
    Product.findByIdAndUpdate(req.params.id,req.body.sellingPrice,function(err,product){
        if(err){
            console.log('Was not able to update the price of the product');
        }else{
            product.sellingPrice=req.body.sellingPrice;
            request('http://api.walmartlabs.com/v1/items/'+product.itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
                //Updating information 
                var parsedData=JSON.parse(body);
                //Only information that matters
                product.price=(parsedData['salePrice']); 
                product.standardShipRate=(parsedData['standardShipRate']);
                product.stock=(parsedData['stock']); 
                product.availableOnline=(parsedData['availableOnline']);
               //Arithmatic with Updated Price
                product.tax=product.price *.08;
                product.ebayFee=product.sellingPrice * .1;
                product.paypalFee=(product.sellingPrice * .029) +.3;
                product.net=product.sellingPrice-(product.ebayFee+product.paypalFee+product.price+product.tax+product.standardShipRate);
                product.save(function(err,data){
                    if(err){
                        console.log('Failed to update form due to');
                        console.log(err);
                    }else{
                        res.redirect('/');
                    }
                });
            });
        }
    });
});

module.exports=router;