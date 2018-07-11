var mongoose=require('mongoose');
var Product=require('./models/product');
var cheerio = require('cheerio');
var request = require('request');


var xlist = [
    189596953,
    49299983,
    54474644,
    54474639,
    39893701,
    362740797,
    33994463,
    39893702,
    37643667,
    515168847,
    542572681,
    39071349,
    13044874,
    846796154,
    19766458,
    17164240,
    17299558,
    695836787,
    13917731,
    21345449,
    11011860,
    13917728,
    211308352,
    541039777
]


function awesome(){
xlist.forEach(function(id){
    sellingPrice=0;
request('http://api.walmartlabs.com/v1/items/'+id+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
    //Handle Error
    if(error || response.statusCode !==200){
        console.log('Could not request Item '+id);
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
                 itemId:id,
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
                    console.log('Database could not save product '+id);
                }
            });
    }
});
});
}

module.exports=awesome;
