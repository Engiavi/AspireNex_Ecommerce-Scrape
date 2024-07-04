import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

// Define a type for the product data
interface ProductData {
    url: string;
    title: string;
    currentPrice: number;
    originalPrice: number;
    outOfstock: boolean;
    image: string;
    currency: string;
    discountRate: number;
    priceHistory: { currentPrice: number; originalPrice: number; date: Date }[];
    category: string;
    reviewsCount: number;
    stars: number;
    description: string;
    isOutOfStock: boolean;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
}

async function saveProductToDatabase(product: ProductData) {
    // Implement the logic to save the product to your database
    // This could be an API call or a database query
}

async function fetchProductFromDatabase(url: string): Promise<ProductData | null> {
    // Implement the logic to fetch the product from your database by URL
    // This could be an API call or a database query
    // For now, let's assume it returns a product object or null if not found
    return null; // Replace this with actual fetching logic
}

const updatePriceHistory = (product: ProductData, newCurrentPrice: number, newOriginalPrice: number) => {
    const priceHistory = [...product.priceHistory];

    // Add new current and original prices to the price history if not exist
    const date = new Date();
    if (!priceHistory.some(priceEntry => priceEntry.currentPrice === newCurrentPrice && priceEntry.originalPrice === newOriginalPrice)) {
        priceHistory.push({ currentPrice: newCurrentPrice, originalPrice: newOriginalPrice, date });
    }

    return priceHistory;
};

const updateProductData = async (product: ProductData, newCurrentPrice: number, newOriginalPrice: number) => {
    // Update price history
    product.priceHistory = updatePriceHistory(product, newCurrentPrice, newOriginalPrice);

    // Update other product properties if needed
    product.currentPrice = newCurrentPrice;
    product.originalPrice = newOriginalPrice;
    product.lowestPrice = Math.min(...product.priceHistory.map(entry => entry.currentPrice));
    product.highestPrice = Math.max(...product.priceHistory.map(entry => entry.currentPrice));
    product.averagePrice = product.priceHistory.reduce((a, b) => a + b.currentPrice, 0) / product.priceHistory.length;

    // Save updated product to the database
    await saveProductToDatabase(product);
};

export async function scrapeProducts(url: string) {
    if (!url) return;
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    };

    try {
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);
        // Extract the product details
        let title = $('#productTitle').text().trim();
        let currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base')
        );
        const originalPrice = extractPrice(
            $('.a-spacing-small .aok-relative .basisPrice .a-price .a-offscreen')
        );
        const outOfstock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';
        const image = $('imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image') || '{}';
        const imageURLs = Object.keys(JSON.parse(image));
        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');
        const description = extractDescription($);

        // Fetch the existing product data from the database
        const existingProduct = await fetchProductFromDatabase(url);

        // Construct the initial data object with scraped information
        const newCurrentPrice = Number(currentPrice) || Number(originalPrice);
        const newOriginalPrice = Number(originalPrice) || Number(currentPrice);
        let data: ProductData = {
            url,
            title,
            currentPrice: newCurrentPrice,
            originalPrice: newOriginalPrice,
            outOfstock,
            image: imageURLs[0],
            currency: currency || '₹',
            discountRate: Number(discountRate),
            priceHistory: [],
            category: 'category',
            reviewsCount: 100,
            stars: 4.5,
            description,
            isOutOfStock: outOfstock,
            lowestPrice: newCurrentPrice,
            highestPrice: newCurrentPrice,
            averagePrice: newCurrentPrice,
        };

        if (existingProduct) {
            // If the product exists, update its data
            await updateProductData(existingProduct, newCurrentPrice, newOriginalPrice);
            data = existingProduct;
        } else {
            // If the product doesn't exist, initialize its price history and save it to the database
            data.priceHistory = updatePriceHistory(data, newCurrentPrice, newOriginalPrice);
            await saveProductToDatabase(data);
        }

        return data;
    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}
