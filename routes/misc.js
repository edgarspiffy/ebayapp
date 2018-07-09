var express = require('express');
var router=express.Router();
var Product=require('../models/product');
var request = require('request');
var cheerio = require('cheerio');

//DIRECT to DISPLAY
router.get('/',function(req,res){
    res.redirect('/display');
});

//Update Route
router.post('/update',function(req,res){
    //find
    Product.find({},function(err,product){
    //loop
        product.forEach(function(product){
            console.log(product.itemId);
            request('http://api.walmartlabs.com/v1/items/'+product.itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
                if(error || response.statusCode !==200){
                    console.log(error);
                    console.log('sorry something went wrong with the request'+product.itemId);
                }else{
                    //now we are going to parse the JSON we retrieved
                    var parsedData=JSON.parse(body);
                            //Check to see if we need to udpate
                          if(product.itemId!==(parsedData['itemId']) || 
                           product.name  !==(parsedData['name'])   ||
                           product.price !==(parsedData['salePrice']) ||
                           product.standardShipRate !==(parsedData['standardShipRate']) ||
                           product.availableOnline!==(parsedData['availableOnline']) ||
                           //This checks to see if the price has changed
                           product.sellingPrice * .1!== product.ebayFee
                            ){
                             product.name=(parsedData['name']); 
                             product.price=(parsedData['salePrice']); 
                             product.productUrl=(parsedData['productUrl']);
                             product.upc=(parsedData['upc']);
            
                           
                             product.standardShipRate=(parsedData['standardShipRate']);
                             product.stock=(parsedData['stock']); 
                             product.availableOnline=(parsedData['availableOnline']);

                             product.categoryPath=(parsedData['categoryPath']);
                             product.shortDescription=(parsedData['shortDescription']);
                             product.longDescription=(parsedData['longDescription']);

                             product.brandName=(parsedData['brandName']);
                             product.modelNumber=(parsedData['modelNumber']);
                            
                             product.tax=product.price *.08;
                             product.ebayFee=product.sellingPrice * .1;
                             product.paypalFee=(product.sellingPrice * .029) +.3;
                             product.net=product.sellingPrice-(product.ebayFee+product.paypalFee+product.price+product.tax+product.standardShipRate);
                             console.log('about to save');
                                 product.save(function(err,data){
                                    if(err){
                                        console.log(err);
                                        console.log('yo there was an error saving the products');
                                    }else{
                                        console.log('this saved succesfully');
                                        console.log('updating all done for '+product.itemId);
                                    //else clsoing
                                    }
                                    //SORT OF WORKS WHEN I INCLUDE IT HERE
                                    
                                //Save for call back
                                 });



                            // if closing bracked
                            }
                //else closing bracked
                }
                
            //clsoing for request
            });
            
        //Closing for Loop
        });
        console.log('about to redirect');
        res.redirect('/');
       //WORKS WHEN I INCLUDE IT HERE BUT I NEED TO FORCE REFRESH
    //closing for product.find all
    });
  
//closing for main
});


//DELETE ROUTE
router.delete('/:id',function(req,res){
    Product.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/display');
        }
    });
});



module.exports=router;