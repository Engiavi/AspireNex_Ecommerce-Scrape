import mongoose from 'mongoose';

let isConnected = false; // Database connection status

export const connectToDB = async () => {
    mongoose.set('strictQuery',true)//use for strict query helps to avoid errors and warnings
    if(!process.env.MONGO_URI){
        return console.log('MONGO_URI is not defined')
    }
    if(isConnected){
        console.log('Using existing database connection')
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI)
        isConnected = true
        console.log('Database connected successfully!')
    } catch (error) {
        console.log('Error connecting to database: ', error)
    }
}