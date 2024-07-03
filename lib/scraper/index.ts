import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice, 
    // extractTitleFlipKart 
} from '../utils';
export async function scrapeProducts(url: string) {
    if (!url) return;
    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const port = 22225
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }
    try {
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data)
        //extract the product details
        let title = $('#productTitle').text().trim();
        // if (!title) {
        //     title = extractTitleFlipKart(
        //         $("div.css-175oi2r"),
        //         $("div.css-1rynq56"),
        //         $("span.css-1qaijid"),

        //     )
        // }
        let currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base')
        );
        // if(!currentPrice){
        //     currentPrice = extractPrice(
        //         $('div.css-175oi2r'),
        //         $('div.css-1rynq56 r-11wrixw')
        //         // $('div._3I9_wc')
        //     )
        // }  
        const originalPrice = extractPrice(
            $('.a-spacing-small .aok-relative .basisPrice .a-price .a-offscreen')
            // $('#priceblock_ourprice'),
            // $('#listPrice'),
            // $('#priceblock_dealprice'),
            // $('.a-size-base.a-color-price')
        );
        const outOfstock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const image = $('imgBlkFront').attr('data-a-dynamic-image')|| $('#landingImage').attr('data-a-dynamic-image') || '{}';

        const imageURLs = Object.keys(JSON.parse(image));

        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');
        // console.log({ title, currentPrice, originalPrice, outOfstock,image,currency,discountRate});
        //construct data object with scraped information
        const description = extractDescription($);
        const data = {
            url,
            title,
            currentPrice :Number(currentPrice) || Number(originalPrice),
            originalPrice:Number(originalPrice) || Number(currentPrice),
            outOfstock,
            image:imageURLs[0],
            currency:currency||'₹',
            discountRate:Number(discountRate),
            priceHistory: [],
            category:'category',
            reviewsCount :100,
            stars:4.5,
            description,     
            isOutOfStock:outOfstock,
            lowestPrice :Number(currentPrice) || Number(originalPrice),
            highestPrice : Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice) ,
        }
        return data;
    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}