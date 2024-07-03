import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeProducts(url:string){
    if(!url) return;
    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const port = 22225
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth:{
            username:`${username}-session-${session_id}`,
            password
        },
        host:'brd.superproxy.io',
        port,
        rejectUnauthorized:false,
    }
    try{
        const response= await axios.get(url,options)
        const $ = cheerio.load(response.data)
        //extract the product details
        let title = $('#productTitle').text().trim();
        if (!title) {
            title = $(".css-1rynq56").text().trim();
        }
        console.log(title)
    }catch(error: any){
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}