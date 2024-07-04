// import { NextResponse } from "next/server";
// import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
// import { connectToDB } from "@/lib/mongoose";
// import Product from "@/lib/models/product.model";
// import { scrapeProducts } from "@/lib/scraper";
// import { generateEmailBody, sendMail } from "@/lib/node_mailer";

// // Define the Product type

// // Define the PriceHistoryItem type
// type PriceHistoryItem = {
//   price: number;
//   date: Date;
// };

// // Define the ProductType
// type ProductType = {
//   url: string;
//   currency: string;
//   image: string;
//   title: string;
//   currentPrice: number;
//   originalPrice: number;
//   priceHistory: PriceHistoryItem[];
//   lowestPrice?: number;
//   highestPrice?: number;
//   averagePrice?: number;
//   discountRate?: number;
//   description?: string;
//   category?: string;
//   stars: number;
//   reviewsCount?: number;
//   isOutOfStock?: boolean;
//   users: { email: string }[];
// };

// // Define the ProductData type
// type ProductData = {
//   url: string;
//   currency: string;
//   image: string;
//   title: string;
//   currentPrice: number;
//   originalPrice: number;
//   priceHistory: {
//     currentPrice: number;
//     date: Date;
//   }[];
// };

// // Convert ProductData to ProductType
// const convertProductDataToProduct = (productData: ProductData): ProductType => {
//   return {
//     ...productData,
//     priceHistory: productData.priceHistory.map(item => ({
//       price: item.currentPrice,
//       date: item.date
//     })),
//     users: [] // Initialize users array, adjust as needed
//   };
// };



// export const maxDuration = 300; // This function can run for a maximum of 300 seconds
// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET(request: Request) {
//   try {
//     await connectToDB();

//     const products = await Product.find({});

//     if (!products) throw new Error("No product fetched");

//     // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
//     const updatedProducts = await Promise.all(
//       products.map(async (currentProduct) => {
//         // Scrape product
//         const scrapedProductData = await scrapeProducts(currentProduct.url);

//         if (!scrapedProductData) return;

//         // Convert scrapedProductData to ProductType
//         const scrapedProduct = convertProductDataToProduct(scrapedProductData);

//         const updatedPriceHistory = [
//           ...currentProduct.priceHistory,
//           {
//             price: scrapedProduct.currentPrice,
//             date: new Date() // Assuming you want to add the current date
//           }
//         ];

//         const product: ProductType = {
//           ...scrapedProduct,
//           priceHistory: updatedPriceHistory,
//           lowestPrice: getLowestPrice(updatedPriceHistory),
//           highestPrice: getHighestPrice(updatedPriceHistory),
//           averagePrice: getAveragePrice(updatedPriceHistory),
//           users: currentProduct.users // Retain the existing users
//         };

//         // Update Products in DB
//         const updatedProduct = await Product.findOneAndUpdate(
//           {
//             url: product.url,
//           },
//           product,
//           { new: true } // Return the updated product
//         );

//         // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
//         const emailNotifType = getEmailNotifType(
//           scrapedProduct,
//           currentProduct
//         );

//         if (emailNotifType && updatedProduct?.users.length > 0) {
//           const productInfo = {
//             title: updatedProduct.title,
//             url: updatedProduct.url,
//           };
//           // Construct emailContent
//           const emailContent = await generateEmailBody(productInfo, emailNotifType);
//           // Get array of user emails
//           const userEmails = updatedProduct.users.map((user: any) => user.email);
//           // Send email notification
//           await sendMail(emailContent, userEmails);
//         }
//         return updatedProduct;
//       })
//     );

//     return NextResponse.json({
//       message: "Ok",
//       data: updatedProducts,
//     });
//   } catch (error: any) {
//     throw new Error(`Failed to get all products: ${error.message}`);
//   }
// }
