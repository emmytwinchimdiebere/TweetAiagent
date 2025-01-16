import { getRecentMentions} from "@/lib/TwitterBot";
import { NextResponse } from "next/server";



export async  function  GET(){
    try {
        const  respponse =  await getRecentMentions();

       return NextResponse.json({
        message:respponse
       })
        
    } catch (error) {
        return NextResponse.json({
            error:"an error  occurred",
            msg:error
        })
    }
}