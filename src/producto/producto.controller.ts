import { Controller, Post, Res, HttpStatus, Body, Get, Param, NotFoundException, Delete, Query, Put, UseInterceptors } from '@nestjs/common';
import { ProductService } from "./producto.service";
import { MorganInterceptor } from 'nest-morgan';
import { CreateProductoDTO } from "./dto/producto.dto";


@Controller('product')
export class ProductController {

    constructor(private productService: ProductService) { }


    //carga data en mongo desde un archivo txt
    @Get('/data')
    async getdata(@Res() res) {
        const readline = require("readline"),
        fs = require("fs"),
        NOMBRE_ARCHIVO = "data/data4.txt";        
        let lector = readline.createInterface({
            input: fs.createReadStream(NOMBRE_ARCHIVO)
        });
        lector.on("line", linea => {
            const mm = linea.split('\t');
            const moneda = new (CreateProductoDTO)
            moneda.Fecha = mm[0]
            moneda.Open = mm[1]
            moneda.High = mm[2]
            moneda.Low = mm[3]
            moneda.Close = mm[4]
            moneda.VolumeBTC = mm[5]
            moneda.VolumeCurrency = mm[6]
            moneda.WeightedPrice = mm[7]
            this.productService.createProductoBitcoin(moneda); 
        });
        return res.status(HttpStatus.OK).json({'trabajando...':'listo!'})
    }


    // crea un producto Bitcoin
    @Post('/create')
    async createProducto(@Res() res, @Body() createProductDTO: CreateProductoDTO) {
        const product = await this.productService.createProducto(createProductDTO);
        return res.status(HttpStatus.OK).json({
            message: 'creado',
            product
        });
    }
    

    // lista de mongo
    @Get('/lista/mongo')
    async getProductos(@Res() res) {
        const products = await this.productService.getProductos();
        return res.status(HttpStatus.OK).json(products);
    }
    
    
  
    // calcula RSI
    @Get('/calcula/RSI')
    async getCalculo(@Res() res) {
        
        const products = await this.productService.getProductos();
        let Varia=[0]
        let SerieGanancias=[]
        let SeriePerdidas =[]
        let PromedioGanancia=[]
        let PromedioPerdida=[]
        let RS=[]
        let RSI=[]
        let ultimo=0
        let Variacion=0
        let mayores=0
        let menores=0
        let todo =[]
        let rango=14

        products.forEach((element,i)=>{
            
            Variacion = Number(element.Open) - ultimo
            
            mayores = Variacion>0 ? Variacion:0
            menores = Variacion<0 ? -Variacion:0
            if(i==0)
            {
                SerieGanancias.push(0)
                SeriePerdidas.push(0)
                PromedioGanancia.push(0)
                PromedioPerdida.push(0)  
                RS.push(0)
                RSI.push(0)                              
            }            
            if(i>0)
            {
                Varia.push(Variacion)
                SerieGanancias.push(mayores)
                SeriePerdidas.push(menores)
            }
            if(i>0 &&  i<rango ){
                PromedioGanancia.push(0)
                PromedioPerdida.push(0)
                RS.push(0)
                RSI.push(0)
            }
            if(i==rango){

              let sum1 = SerieGanancias.reduce((previous, current) => current += previous);
              let avg1 = sum1 / (SerieGanancias.length-1);
              PromedioGanancia.push(avg1)

              let sum2 = SeriePerdidas.reduce((previous, current) => current += previous);
              let avg2 = sum2 / (SeriePerdidas.length-1);
              PromedioPerdida.push(avg2)

              if(avg2==0){
                  RS.push(avg1/avg2)
                  RSI.push(100)
                }else{
                  RS.push(avg1/avg2)
                  RSI.push(100-(100/(1+RS[i])))
                }
            }
            if(i>rango){
                 const tt1=( PromedioGanancia[i-1]*13 + SerieGanancias[i] )/rango
                 PromedioGanancia.push(tt1)

                 const tt2=( PromedioPerdida[i-1]*13 + SeriePerdidas[i] )/rango
                 PromedioPerdida.push(tt2)

                 if(PromedioPerdida[i]==0){
                    RS.push(PromedioGanancia[i]/PromedioPerdida[i])
                    RSI.push(100)
                 }else{
                    RS.push(PromedioGanancia[i]/PromedioPerdida[i])
                    RSI.push(100-(100/(1+RS[i])))
                 }
              }  

            ultimo = Number(element.Open)
            return {SerieGanancias,SeriePerdidas}
        })
        //mejora presentacion en Postman TODO: front
        todo.push(' Fecha   PrecioCierre  Variacion SerieGanancias SeriePerdidas PromedioGanancia PromedioPerdida   RS       RSI')
        products.forEach((element,i)=>{
            todo.push( element.Fecha.toLocaleString().substr(0,9) +' '+
                       (Number(element.Open)).toFixed(4)+'    '+
                       Varia[i].toFixed(4)+'     '+
                       SerieGanancias[i].toFixed(4) +'        '+ 
                       SeriePerdidas[i].toFixed(4)+'        '+ 
                       PromedioGanancia[i].toFixed(4)+'            '+
                       PromedioPerdida[i].toFixed(3)+'         '+
                       RS[i].toFixed(3)+'    '+
                       RSI[i].toFixed(3) )
        })
        return res.status(HttpStatus.OK).json(todo);
    }


    // calcula Spread y promedio periodo data
    @Get('/calcula/SPREAD')
    async getCalculoSpread(@Res() res) {
        const data=[]
        const arreglo=[]
        data.push('  Fecha    Spread')

        const products = await this.productService.getProductos();

        products.forEach((element,i)=>{
            const ddi = Number(element.Close) - Number(element.Open)
            data.push(element.Fecha.toLocaleString().substr(0,9)+'  '+
                     ddi.toFixed(2))
            arreglo.push(Number(ddi))
            return {data,arreglo}
        })

        const red = (accumulator, currentValue) => accumulator + currentValue;
        const average = (arreglo.reduce(red) / arreglo.length)

        return res.status(HttpStatus.OK).json({data,average});
    }



    // obtiene un producto por ID
    @Get('/:productID')
    async getProducto(@Res() res, @Param('productID') productID) {
        const product = await this.productService.getProducto(productID);
        if (!product) throw new NotFoundException('Producto no existe!');
        return res.status(HttpStatus.OK).json(product);
    }



    // borra un producto por ID
    @UseInterceptors(MorganInterceptor('combined'))
    @Delete('/delete')
    async deleteProducto(@Res() res, @Query('productID') productID) {
        const productDeleted = await this.productService.deleteProducto(productID);
        if (!productDeleted) throw new NotFoundException('Producto no existe!');
        return res.status(HttpStatus.OK).json({
            message: 'Producto Borrado Exitosamente',
            productDeleted
        });
    }


    // modifica un producto
    @Put('/update')
    async updateProducto(@Res() res, @Body() createProductDTO: CreateProductoDTO, @Query('productID') productID) {
        const updatedProduct = await this.productService.updateProducto(productID, createProductDTO);
        if (!updatedProduct) throw new NotFoundException('Producto no existe!');
        return res.status(HttpStatus.OK).json({
            message: 'Producto Modificado exitosamente',
            updatedProduct 
        });
    }

}
