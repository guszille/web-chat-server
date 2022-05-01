// Node Libs.
import dotenv from 'dotenv'
import mongodb from 'mongodb'

// Enable .env configuration.
dotenv.config()

// Mongo database client connection.
const DB_CLIENT = new mongodb.MongoClient(process.env.MONGODB_URI)

// Mongo database name.
const DB_NAME = process.env.DB_NAME

export const getDatabaseCollection = (collection) => {
    return DB_CLIENT.db(DB_NAME).collection(collection)
}

// Generator to mannage database connection.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*.
//
export const wrapperDBConnSwitcher = async () => {
    async function* wrappedSwitcher() {
        yield await DB_CLIENT.connect()

        // Waiting next switch command.

        await DB_CLIENT.close()
    }

    const generator = wrappedSwitcher()
    const client = await generator.next() // Auto-start the generator.

    if (!client) {
        throw new Error('Failed to connect with MongoDB client!')
    }

    return generator
}
