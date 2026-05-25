import mongoose from "mongoose";

export async function dbConnection() {
    mongoose
        .connect(process.env.DB_URL as string)
        .then(()=>console.log("Databse connected!"))
        .catch(()=>console.log("Database connection failed"));
}