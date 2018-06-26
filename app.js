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

    //Home Page Route Redirect
    app.get('/',function(req,res){
        res.redirect('/add');
    });
    //Redirect from Above
    app.get('/add',function(req,res){
        res.render('add');
    });

    //Add Route
    app.post('/add',function(req,res){
        //Collects selling price and item id
        var sellingPrice=req.body.sellingPrice;
        var itemId=req.body.itemId;
        //API Key Request for information
        request('http://api.walmartlabs.com/v1/items/'+itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
            //Handle Error
            if(error || response.statusCode !==200){
                console.log('sorry this item doesn\'t exist');
                return res.redirect('/add');
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
                            console.log('error');
                        }else{
                            res.redirect('/add');
                        }
                    });
            }
        });
    });



    //Displays Data Route
    app.get('/run',function(req,res){
        Product.find({},function(err,product){
            if(err){
                console.log(err);
            }else{
                res.render('display',{product:product});
            }
        });
    });


    //Updated Post
    app.post('/update',function(req,res){
    Product.find({},function(err,product){
        product.forEach(function(product){
            request('http://api.walmartlabs.com/v1/items/'+product.itemId+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
                if(error || response.statusCode !==200){
                    console.log('error');
                }else{
                    var parsedData=JSON.parse(body);
                    if(product.itemId!=(parsedData['itemId']) || 
                       product.name  !=(parsedData['name'])   ||
                       product.price !=(parsedData['salePrice']) ||
                       product.standardShipRate !=(parsedData['standardShipRate']) ||
                       product.availableOnline!=(parsedData['availableOnline'])
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
                             product.save;
                    }else {
                        console.log('things look great');
                    }
                    //need a way to compare current data with request info. only checking 4 main pieces of info i believe
                    //if a changed occur I should have a way to anotate that. 
                }
            });
        });
        res.redirect('/run');
    });
});

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
    Product.findByIdAndUpdate(req.params.id,req.body.sellingPrice,function(err,updatedPrice){
        if(err){
            console.log(err);
        }else{
            
            updatedPrice.sellingPrice=req.body.sellingPrice;
            updatedPrice.save(function(err,data){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/run');
                }
            });

        }
    });
});

//delete route
app.delete('/delete/:id',function(req,res){
    Product.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/run');
        }
    });

});


//Specifying page name
app.get('/test',function(req,res){
    res.render('test',{page_name:'test'});
})

//Listen to app
    app.listen(3000,'127.0.0.1',function(){
        console.log('you\'re doing great keep going');
    });

 
