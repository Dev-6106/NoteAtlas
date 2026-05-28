import { google } from "googleapis";
import { Request, Response, NextFunction } from "express";
import { SearchToolData } from "@/app/tools/SearchToolData";

export async function searchWeb(req: Request, res: Response, next: NextFunction){
    try {
        const query = req.query.query;
        if(!query || typeof query !== "string") return res.status(422).send({message: "Query should not be empty"});

        const searchTool = new SearchToolData('exa');
        const searchResult = await searchTool.invoke(query);

        const data = [];
        const parsedWebResult = JSON.parse(searchResult as any) as {results:Array<{title:string, text: string, url: string}>};

        if(Array.isArray(parsedWebResult?.results)){
            for(const webResult of parsedWebResult?.results)
                data.push({title:webResult?.title, link:webResult?.url,text:webResult?.text});
        }
        res.status(200).json({data});
    } catch (error) {
        next(error);
    }
}