import mongoose from "mongoose";

export async function dbConnection() {
    mongoose
        .connect("mongodb://127.0.0.1:27017/notebooklm")
        .then(()=>console.log("Databse connected!"))
        .catch(()=>console.log("Database connection failed"));
}