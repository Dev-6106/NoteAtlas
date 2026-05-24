import { Express,Request,Response } from "express";
import cors from "cors";
import express from "express";

export function expressServer(app:Express,PORT:number) {
    app.use(cors({
        origin: '*',
        credentials:true
    }));
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.get('/',(req:Request,res:Response)=>{
        res.json({message: "Express app is running"});
    })
    app.listen(PORT,()=>{
        console.log("App is running at port 8000...")
    })
}