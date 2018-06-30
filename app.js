var express = require('express'),
    app     = express(),
    cheerio = require('cheerio'),
    request = require('request'),
    mongoose= require('mongoose'),
    bodyParser=require('body-parser'),
    methodOverride=require('method-override'),
    Product=require('./models/product');

    mongoose.connect('mongodb://localhost/ebayapp');
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.static(__dirname+'/public'));
    app.use(methodOverride('_method'));
    app.set('view engine','ejs');

//API KEY
//2nb5kyd94fhvu2wd92ujsdrd


    //Displays Data Route
    app.get('/',function(req,res){
        Product.find({},function(err,product){
            if(err){
                console.log(err);
            }else{
                res.render('display',{product:product});
            }
        });
    });

    
    //Add Product to Data Base
    app.post('/',function(req,res){
        //Collects selling price and item id
        var sellingPrice=req.body.sellingPrice;
        var itemId=req.body.itemId;
        if(!sellingPrice.length){
            sellingPrice=0;
        };
        //API Key Request for information
        request('http://api.walmartlabs.com/v1/items/'+itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
            //Handle Error
            if(error || response.statusCode !==200){
                console.log('sorry this item doesn\'t exist');
                return res.redirect('/');
            }else{
                //Parsed the JSON Data
                var parsedData=JSON.parse(body);
                //Assigned variables to collected data
                var name=(parsedData['name']); 
                var price=(parsedData['salePrice']); 
                var productUrl=(parsedData['productUrl']);

            
                var standardShipRate=(parsedData['standardShipRate']);
                var stock=(parsedData['stock']); 
                var availableOnline=(parsedData['availableOnline']);
                
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
                    
                        standardShipRate:standardShipRate,
                        stock:stock,
                        availableOnline:availableOnline,
                    
                        tax:tax,
                        ebayFee:ebayFee,
                        paypalFee:paypalFee,
                        net:net 
                    };
                    //Create that object in database
                    Product.create(itemInfo,function(err){
                        if(err){
                            console.log('error was not able to save in the database');
                        }else{
                            res.redirect('/'); 
                        }
                    });
            }
        });
    });

    app.post('/update',function(req,res){
        //find
        Product.find({},function(err,product){
        //loop
            product.forEach(function(product){
                request('http://api.walmartlabs.com/v1/items/'+product.itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
                    if(error || response.statusCode !==200){
                        console.log(error);
                        console.log('sorry something went wrong with the request');
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
                
                               
                                 product.standardShipRate=(parsedData['standardShipRate']);
                                 product.stock=(parsedData['stock']); 
                                 product.availableOnline=(parsedData['availableOnline']);
                                
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
                                            console.log('updating all done');
                                        //else clsoing
                                        }
                                        //SORT OF WORKS WHEN I INCLUDE IT HERE
                                        res.redirect('/');
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
    
           //WORKS WHEN I INCLUDE IT HERE BUT I NEED TO FORCE REFRESH
        //closing for product.find all
        });
      
    //closing for main
    });

//     //Updated Post
//     app.post('/update',function(req,res){
//     Product.find({},function(err,product){
//         product.forEach(function(product){
//             request('http://api.walmartlabs.com/v1/items/'+product.itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
//                 if(error || response.statusCode !==200){
//                     console.log(error);
//                     console.log('sorry listings could not update');
//                 }else{
//                     console.log('update is working but something is up');
//                     console.log(product.sellingPrice);
//                     console.log(product.ebayFee);
//                     var parsedData=JSON.parse(body);
//                     if(product.itemId!==(parsedData['itemId']) || 
//                        product.name  !==(parsedData['name'])   ||
//                        product.price !==(parsedData['salePrice']) ||
//                        product.standardShipRate !==(parsedData['standardShipRate']) ||
//                        product.availableOnline!==(parsedData['availableOnline']) ||
//                        //This checks to see if the price has changed
//                        product.sellingPrice * .1!== product.ebayFee
//                         ){
//                              product.name=(parsedData['name']); 
//                              product.price=(parsedData['salePrice']); 
//                              product.productUrl=(parsedData['productUrl']);
            
                           
//                              product.standardShipRate=(parsedData['standardShipRate']);
//                              product.stock=(parsedData['stock']); 
//                              product.availableOnline=(parsedData['availableOnline']);
                            
//                              product.tax=product.price *.08;
//                              product.ebayFee=product.sellingPrice * .1;
//                              product.paypalFee=(product.sellingPrice * .029) +.3;
//                              product.net=product.sellingPrice-(product.ebayFee+product.paypalFee+product.price+product.tax+product.standardShipRate);
//                              console.log('about to save');
//                              product.save(function(err,data){
//                                  if(err){
//                                      console.log(err);
//                                      console.log('something went wrong updating');
//                                  }else{
//                                      console.log('everything worked great on updating');
//                                  }
                                
//                              })
//                              ;
                            
//                     }else {
//                         console.log('things look great');
//                     }
//                     //need a way to compare current data with request info. only checking 4 main pieces of info i believe
//                     //if a changed occur I should have a way to anotate that. 
//                 }
//             });
//         });
//         res.redirect('/');
//     });
// });

//Edit Route
app.get('/edit/:id',function(req,res){
    Product.findById(req.params.id,function(err,product){
        if(err){
            console.log(err);
        }else{
            res.render('edit',{product:product});
        }
    });
   
});

//EDIT ROUTE submit
app.put('/edit/:id',function(req,res){
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
                        res.redirect('/');
                    }
                });


            });

        }
    });
});


// app.put('/edit/:id',function(req,res){
//     Product.findByIdAndUpdate(req.params.id,req.body.sellingPrice,function(err,product){
//         if(err){
//             console.log(err);
//         }else{
//             product.sellingPrice=req.body.sellingPrice;
//             request('http://api.walmartlabs.com/v1/items/'+product.itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){



            
//             });
            
//             product.save(function(err,data){
//                 if(err){
//                     console.log(err);
//                 }else{
//                     res.redirect('/');
//                 }
//             });

//         }
//     });
// });
//delete route
app.delete('/:id',function(req,res){
    Product.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });

});


//Specifying page name
app.get('/test',function(req,res){
    res.render('test',{page_name:'test'});
});

app.post('/null',function(req,res){
    var nullTest=req.body.null;
    if(!nullTest.length){
        console.log('this is empty');
    }else{
        console.log(req.body.null);
        console.log('this route is working');
        res.redirect('/test');
    }
});

//Listen to app
    app.listen(3000,'127.0.0.1',function(){
        console.log('you\'re doing great keep going');
    });

 
