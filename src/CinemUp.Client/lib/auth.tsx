import {api} from "@/lib/api-client";

export async function createUser(email: string, password: string, username: string, ){
     const response: any = await api.post("/User/sign-up", 
        {
            email:email,
            password:password,
            username:username
        });
     const token = response.token;
     return token;
}

export async function loginUser(email: string, password: string){
    const response: any = await api.post("/User/login",
        {
            email:email,
            password:password,
        });
    const token = response.token;
    return token;
}

