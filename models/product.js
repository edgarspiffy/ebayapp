var mongoose=require('mongoose'),
    Schema=mongoose.Schema;

var productSchema = new Schema({
    sellingPrice:Number,
    itemId:Number,

    name:String,
    price:Number,
    productUrl:String,

    standardShipRate:Number,
    stock:String,
    availableOnline:Boolean,

    tax:Number,
    ebayFee:Number,
    paypalFee:Number,
    net:Number
});

module.exports=mongoose.model('Product',productSchema);
