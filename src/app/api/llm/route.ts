import { NextRequest, NextResponse } from "next/server";
import {generateTweet} from "@/lib/TwitterBot";

  
export async function  POST(request:NextRequest){
    
    if(request.method  !== "POST"){
        return  NextResponse.json({
            msg:"Bad Request method"
        }, {status:405})
    }

    const  data  =  await  request.json();

    if(!data){
        return NextResponse.json({data:"user prompt  is missing"},  {status:200})
    }

    try {

        const  response  = await generateTweet(data.data)
        console.log("", response)
        return NextResponse.json({
            data: response
        })
        
    } catch (error:unknown) {
        console.log(error)
        return  NextResponse.json({
            error:error
        })
    }
}
