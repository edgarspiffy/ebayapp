var mongoose=require('mongoose');
var Product=require('./models/product');

//data here


//find and remove
function seedDB(){
    Product.remove({},function(err){
        if(err){
            console.log(err);
        }else{
            console.log('removed products');
            //create new items
            //enter all info here and create one with the same info that is colliding
        }
    });

}