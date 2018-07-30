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
    541039777,
    673871100,
    509065700,
    35909076,
    785531227,
    33168839,
    906284333,
    173018464,
    151603991,
    54906104,
    45091482,
    32803235,
    54322901,
    846982822,
    43371490,
    104359126
 ]


var i = -1;
var sellingPrice=0;
function awesome(){
    setTimeout(function(){
        i++;
        if(i<xlist.length){
            console.log(xlist[i]);
            request('http://api.walmartlabs.com/v1/items/'+xlist[i]+'?apiKey=2nb5kyd94fhvu2wd92ujsdrd&format=json',function(error,response,body){
                if(error || response.statusCode !==200){
                console.log('Could not request Item ');
                console.log(error);
                }else{
                //Parsed the JSON Data
                var parsedData=JSON.parse(body);
                var itemId = xlist[i];
                var active=false;
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
                Product.create(itemInfo,function(err,data){
                    if(err){
                        console.log('Database could not save product ');
                    }else{
                        console.log('saved data')
                    }
                    awesome();
                });
                    
                }
            });
        }
    },200);
}




module.exports=awesome;
