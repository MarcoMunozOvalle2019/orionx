import { Schema } from "mongoose";

export const ProductSchema = new Schema({
    Fecha:Date,
    Open:Number,	
    High:Number,
    Low:Number,
    Close:Number,
    VolumeBTC:Number,
    VolumeCurrency:Number,
    WeightedPrice:Number,
});

