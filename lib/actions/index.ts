"use server"
import { scrapeProducts } from "../scraper";
export async function scrapeAndstoreProduct(productUrl: string) {
    if (!productUrl) return;
    try {
        const scrapedProduct = await scrapeProducts(productUrl);
    } catch (error: any) {
        throw new Error(`Failed to create/update product:${error.message}`)

    }
}