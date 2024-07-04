"use server"
import { scrapeProducts } from "../scraper";
import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { revalidatePath } from "next/cache";
import { generateEmailBody, sendMail } from "../node_mailer";
import { User } from "@/types";

export async function scrapeAndstoreProduct(productUrl: string) {
    if (!productUrl) return;
    try {
        connectToDB();
        const scrapedProduct = await scrapeProducts(productUrl);
        if (!scrapedProduct) return;

        const existingProduct = await Product.findOne({ url: scrapedProduct.url });
        let product = scrapedProduct;

        if (existingProduct) {
            const updatedPriceHistory = [
                ...existingProduct.priceHistory,
                { currentPrice: scrapedProduct.currentPrice, originalPrice: scrapedProduct.originalPrice, date: new Date() }
            ];
            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory.map(item => item.currentPrice)),
                highestPrice: getHighestPrice(updatedPriceHistory.map(item => item.currentPrice)),
                averagePrice: getAveragePrice(updatedPriceHistory.map(item => item.currentPrice))
            };
        } else {
            product.priceHistory = [{ currentPrice: scrapedProduct.currentPrice, originalPrice: scrapedProduct.originalPrice, date: new Date() }];
        }

        const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url },
            product,
            { new: true, upsert: true }
        );

        revalidatePath(`/products/${newProduct._id}`);
    } catch (error: any) {
        throw new Error(`Failed to create/update product: ${error.message}`);
    }
}

export async function getProductId(productId: string) {
    try {
        connectToDB(); 
        const product = await Product.findById({ _id: productId });
        if (!product) {
            return null;
        }
        return product;
    } catch (error) {
        console.log(error);
    }
}

export async function getAllProducts() {
    try {
        connectToDB(); 
        const products = await Product.find();
        return products;
    } catch (error) {
        console.log(error);
    }
}

export async function getSimilarProducts(productId: string) {
    try {
        connectToDB();
        const currentProduct = await Product.findById(productId);
        if (!currentProduct) return null;
        const similarProducts = await Product.find({
            _id: { $ne: productId },
        }).limit(3);
        return similarProducts;
    } catch (error) {
        console.log(error);
    }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
        const product = await Product.findById(productId);
        if (!product) return;
        const userExists = product.users.some((user: User) => user.email === userEmail);
        if (!userExists) {
            product.users.push({ email: userEmail });
            await product.save();
            const emailContent = await generateEmailBody(product, "WELCOME");
            await sendMail(emailContent, [userEmail]);
        }
    } catch (error) {
        console.log(error);
    }
}
