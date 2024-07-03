"use client"
import { scrapeAndstoreProduct } from '@/lib/actions';
import React, { FormEvent, useState } from 'react'
const isValidAmzProductUrl = (url: string) => {
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname;
        // Check if the URL is from Amazon, Flipkart, Myntra, or any big brand company
        if (hostname.includes('amazon') ||
            hostname.includes('amzn') || hostname.includes('flipkart') || hostname.includes('myntra') || hostname.includes('tatacliq') || hostname.includes('jiomart')  /* Add more big brand company checks here */) {
            return true;
        } else {
            throw new Error('Invalid URL. Please provide a URL from Amazon, Flipkart, Myntra, or any big brand company.');
        }
    } catch (error) {
        // Handle suitable error here
        console.error(error);
        return false;
    }
}

const SearchBar = () => {
    const [searchPrompt, setSearchPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit =async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const isValidLink = isValidAmzProductUrl(searchPrompt);
        if (!isValidLink) {
            return alert('Please provide a valid link for ecommerce website');
        }
        // else if (!searchPrompt.includes('amazon') && !searchPrompt.includes('flipkart') && !searchPrompt.includes('myntra') && !searchPrompt.includes('tatacliq') && !searchPrompt.includes('jiomart') /* Add more big brand company checks here */) {
        //     return alert('Please paste a link of any ecommerce website');
        // }
        try {
            setIsLoading(true);
            const product = await scrapeAndstoreProduct(searchPrompt);
            console.log(product);
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    }
    return (
        <>
            <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
                <input type='text' placeholder='Enter product link' className='searchbar-input' value={searchPrompt} onChange={(e) => setSearchPrompt(e.target.value)} />
                <button type='submit' className='searchbar-btn'
                    disabled={searchPrompt === ''}>
                    {isLoading ? 'Searching' : 'Search'}
                </button>
            </form>
        </>
    )
}
export default SearchBar;