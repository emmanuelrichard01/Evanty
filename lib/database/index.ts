import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface Cached {
    conn: Connection | null;
    promise: Promise<Connection> | null;
}

declare global {
    var mongooseCache: Cached;
}

global.mongooseCache = global.mongooseCache || { conn: null, promise: null };

const cached = global.mongooseCache;

export const connectToDatabase = async (): Promise<Connection> => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: 'evanty',
            bufferCommands: false,
        }).then(mongoose => {
            console.log('Connected to MongoDB');
            return mongoose.connection;
        }).catch(err => {
            console.error('Failed to connect to MongoDB', err);
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null; // Reset the promise in case of error
        throw error;
    }

    return cached.conn;
}
