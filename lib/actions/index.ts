"use server"
import { scrapeProducts } from "../scraper";
import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { revalidatePath } from "next/cache";
export async function scrapeAndstoreProduct(productUrl: string) {
    if (!productUrl) return;
    try {
        connectToDB()
        const scrapedProduct = await scrapeProducts(productUrl);
        if(!scrapedProduct) return;
        let product = scrapedProduct;
        const existingProduct = await Product.findOne({url:scrapedProduct.url}); 
        if (existingProduct){
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                {price:scrapedProduct.currentPrice} 
            ]
            product={
                ...scrapedProduct,
                priceHistory:updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice:getHighestPrice(updatedPriceHistory),
                averagePrice:getAveragePrice(updatedPriceHistory)
            }
        }
        const newProduct = await Product.findOneAndUpdate(
            {url:scrapedProduct.url},
            product,
            {new:true, upsert:true}
        );
        revalidatePath(`/products/${newProduct._id}`)
    } catch (error: any) {
        throw new Error(`Failed to create/update product:${error.message}`)

    }
}