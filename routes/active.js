var express = require('express');
var router=express.Router();
var Product=require('../models/product');
var request = require('request');
var cheerio = require('cheerio');


//ADD PRODUCT TO DATABASE WITH ACTIVE PROPERTY..........ROUTER POST TO /active
router.post('/',function(req,res){
    //Collects selling price and item id from forms
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
            return res.redirect('/active');
        }else{
            //Parsed the JSON Data
            var parsedData=JSON.parse(body);
            //Assigned variables to collected data
            var name=(parsedData['name']); 
            var active=true;
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
                    active:active,
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
                        res.redirect('/active')
                    }else{
                        res.redirect('/active'); 
                    }
                });
        }
    });
});

//DISPLAY ROUTE FOR ACTIVE PRODUCTS...........ROUTE IS /active
router.get('/',function(req,res){
    Product.find({'active':'true'},function(err,product){
        if(err){
            console.log(err);
        }else{
            res.render('active',{product:product});
        }
    });
});

//UPDATE SELLING PRICE ON ACTIVE DISPLAY ROUTE.....ROUTE IS /active/:id
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
                        res.redirect('/active');
                    }
                });
            });
        }
    });
});

//INDIVIDIAL ACTIVE PRODUCT PAGE................ROUTE IS /active/product/:id
router.get('/product/:id',function(req,res){
    Product.findById(req.params.id,function(err,product){
        if(err){
            console.log(err);
            console.log('sorry could not retrieve additional product information');
        }else{
            res.render('active_product',{product:product});
        }
    });
});

//EDIT SELLING PRICE FROM PRODUCT PAGE.......ROUTE IS /active/product:id
router.put('/product/:id',function(req,res){
    Product.findByIdAndUpdate(req.params.id,req.body.sellingPrice,function(err,product){
        if(err){
            console.log('Could not update following form due to');
            console.log(err);
        }else{
            product.sellingPrice=req.body.sellingPrice;
            request('http://api.walmartlabs.com/v1/items/'+product.itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
                var parsedData=JSON.parse(body);
                product.price=(parsedData['salePrice']); 
                product.standardShipRate=(parsedData['standardShipRate']);
                product.stock=(parsedData['stock']); 
                product.availableOnline=(parsedData['availableOnline']);
                product.tax=product.price *.08;
                product.ebayFee=product.sellingPrice * .1;
                product.paypalFee=(product.sellingPrice * .029) +.3;
                product.net=product.sellingPrice-(product.ebayFee+product.paypalFee+product.price+product.tax+product.standardShipRate);
                product.save(function(err,data){
                    if(err){
                        console.log('Could not save the new price information due to');
                        console.log(err);
                    }else{
                        res.redirect('/active/product/'+req.params.id);
                    }
                });
            });
        }
    });
});

//TOOGLE ROUTE TO MAKE ITEMS ACTIVE OR INACTIVE....ROUTE IS /active/toggle/:id
router.put('/toggle/:id',function(req,res){
    Product.findByIdAndUpdate(req.params.id,req.body.sellingPrice,function(err,product){
        if(err){
            console.log(err);
        }else{
            console.log(product.active);
            product.active=!product.active;
            console.log(product.active);
            product.save(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/active');
                }
            })
           
        }
    });
});

//ROUTER UPDATE FOR INACTIVE PRODUCTS
router.post('/update',function(req,res){
    console.log('route called');
	Product.find({'active':'true'},function(err,product){
		if(err){
			console.log(err);
		}else{
			update();
			var i = -1;
			function update(){
                console.log('update called');
				setTimeout(function(){
                    i++;
						if(i<product.length){
                            
                            console.log('if statement is true');
							request('http://api.walmartlabs.com/v1/items/'+product[i].itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
                                console.log('request made');
								if(error || response.statusCode !==200){
                                    console.log(error);
                                    console.log('error with request');
								}else{
                                    var parsedData=JSON.parse(body);
										if(product[i].price ===(parsedData['salePrice']) ||
											product[i].standardShipRate !==(parsedData['standardShipRate']) ||
                                            product[i].availableOnline !==(parsedData['availableOnlien']) 
                                            //NO LONGER WILL NEED SELLING PRICE SINCE IT UPDATES WHEN I MAKE CHANGES
											//product.sellingPrice * .1 !== product.ebayFee
											)	{
                                                console.log(product[i].name);
													product[i].name=(parsedData['name']); 
			                                        product[i].price=(parsedData['salePrice']); 
			                                        product[i].productUrl=(parsedData['productUrl']);
			                                        product[i].upc=(parsedData['upc']);
			                                        product[i].standardShipRate=(parsedData['standardShipRate']);
			                                        product[i].stock=(parsedData['stock']); 
			                                        product[i].availableOnline=(parsedData['availableOnline']);
			                                        product[i].categoryPath=(parsedData['categoryPath']);
			                                        product[i].shortDescription=(parsedData['shortDescription']);
			                                        product[i].longDescription=(parsedData['longDescription']);
			                                        product[i].brandName=(parsedData['brandName']);
			                                        product[i].modelNumber=(parsedData['modelNumber']);
			                                        product[i].tax=product[i].price *.08;
			                                        product[i].ebayFee=product[i].sellingPrice * .1;
			                                        product[i].paypalFee=(product[i].sellingPrice * .029) +.3;
                                                    product[i].net=product[i].sellingPrice-(product[i].ebayFee+product[i].paypalFee+product[i].price+product[i].tax+product[i].standardShipRate);
                                                    console.log('about to save');
                        
			                                        product[i].save(function(err,data){
			                                        	if(err){
                                                            console.log(err);
                                                            res.redirect('/active');
			                                        	}else{
			                                        		console.log('this saved succesfully');
                                                        }
                                                        
			                                        });
                                                  
                                                }
                                                
                                }
                                update();
							});
						}
				},200);
            }
            res.redirect('/active');
		}
	});
});

//DELETE ACTIVE PRODUCT
router.delete('/:id',function(req,res){
    Product.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log('Could not delete product due to');
            console.log(err);
        }else{
            res.redirect('/active');
        }
    });
});

module.exports=router;