import { MongoClient } from 'mongodb';

const uri = process.env.DB_URI;
let client;

const connectToMongoDB = async () => {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    return client.db('EmailConfirmationsDb');
};

export const insertEmailConfirmation = async (to, from, subject, status) => {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection('emailConfirmations');

        const confirmation = {
            to,
            from,
            subject,
            status,
            dateSent: new Date(),
        };

        const result = await collection.insertOne(confirmation);
        console.log('Email confirmation saved successfully:', result.insertedId);
    } catch (error) {
        console.error('Error saving email confirmation:', error);
        throw new Error('Failed to save email confirmation');
    }
};
