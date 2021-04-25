import { Injectable } from '@nestjs/common';

import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { precioHistoricoBitcoin } from "./interfaces/producto.interface";
import { CreateProductoDTO } from "./dto/producto.dto";

@Injectable()
export class ProductService {

    constructor(@InjectModel('Coleccion') private readonly productModel: Model<precioHistoricoBitcoin>) {}
    

    // Get all products
    async getProductos(): Promise<precioHistoricoBitcoin[]> {
        const products = await this.productModel.find();
        return products;
    }
    
    // Get a single Product
    async getProducto(productID: string): Promise<precioHistoricoBitcoin> {
        const product = await this.productModel.findById(productID); 
        return product;
    }

    // Post a single product
    async createProducto(createProductDTO: CreateProductoDTO): Promise<precioHistoricoBitcoin> {
        const newProduct = new this.productModel(createProductDTO);
        return newProduct.save();
    }

    // Post a single product
    async createProductoBitcoin(createProductDTO: CreateProductoDTO): Promise<precioHistoricoBitcoin> {
        const newProduct = new this.productModel(createProductDTO);
        return newProduct.save();
    }

    // Delete Product
    async deleteProducto(productID: string): Promise<any> {
        const deletedProduct = await this.productModel.findByIdAndDelete(productID);
        return deletedProduct;
    }

    // Put a single product
    async updateProducto(productID: string, createProductDTO: CreateProductoDTO): Promise<precioHistoricoBitcoin> {
        const updatedProduct = await this.productModel
                            .findByIdAndUpdate(productID, createProductDTO, {new: true});
        return updatedProduct;
    }

}
