var mongoose=require('mongoose');
var Product=require('./models/product');

function wipe(){
    Product.remove({},function(err){
        if(err){
            console.log(err)
        }else{
            console.log('collection gone');
        }
    })
}

module.exports=wipe;