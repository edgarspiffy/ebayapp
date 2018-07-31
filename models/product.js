var mongoose=require('mongoose'),
    Schema=mongoose.Schema;

var productSchema = new Schema({
    sellingPrice:Number,
    itemId:Number,
    active:Boolean,
    ebayProductUrl:String,

    name:String,
    price:Number,
    productUrl:String,
    upc:Number,

    standardShipRate:Number,
    stock:String,
    availableOnline:Boolean,

    tax:Number,
    ebayFee:Number,
    paypalFee:Number,
    net:Number,

    //added stuff
    categoryPath:String,
    shortDescription:String,
    longDescription:String,
    brandName:String,
    modelNumber:String,
    allImages:[{largeImage:String}]
});
//delete large image
module.exports=mongoose.model('Product',productSchema);
