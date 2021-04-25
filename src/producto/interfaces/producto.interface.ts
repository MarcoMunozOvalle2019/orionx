import { Document } from "mongoose";

export interface precioHistoricoBitcoin extends Document {
    readonly Fecha:Date,
    readonly Open:Number,	
    readonly High:Number,
    readonly Low:Number,
    readonly Close:Number,
    readonly VolumeBTC:Number,
    readonly VolumeCurrency:Number,
    readonly WeightedPrice:Number,
}