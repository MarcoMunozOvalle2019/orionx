import { Module } from '@nestjs/common';
import { ProductService } from './producto.service';
import { ProductController } from './producto.controller';
// Mongoose
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './schemas/producto.schema';

import { MorganModule } from 'nest-morgan';

@Module({
  imports: [
    MorganModule.forRoot(),
    MongooseModule.forFeature([{ name: 'Coleccion', schema: ProductSchema }]),
  ],
  providers: [ProductService],
  controllers: [ProductController]
})
export class ProductModule { }
