'use client'

import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Form, FormField} from "@/components/ui/form"
import { toast } from 'sonner'

type FormType = "sign-in" | "sign-up";

const formSignInSchema = (type: FormType) => {
   return z.object({
     name: type === "sign-up" ? z.string().min(2, { message: "Name is required" }) : z.string().optional(),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, { message: "Password must be at least 6 characters" }),
   })
}


const AuthForm = ({type}: {type:FormType}) => {
  const formSchema = formSignInSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    try{
       if(type === "sign-up"){
        console.log("Sign Up data:", data)
        toast.success("Sign Up successful!")
       }else{
         console.log("Sign In data:", data)
         toast.success("Sign In successful!")
       }
    }catch(error){
      console.log(error)
      toast.error(`Something went wrong: ${error}`)
    }
  }

  const isSignIn = type === "sign-in";
  return (
    <div className="card-border lg:min-w-[566px]">
        <div className='flex flex-col gap-6 card py-14 px-10'>
           <div className='flex flex-row gap-2 justify-center '>
             <Image src="/logo.svg" alt="Logo" width={30} height={30} />
                <h2 className='text-primary-100 text-2xl'>Interviewer</h2>
           </div>
            <h3 className='text-center text-2xl font-semibold'>Welcome to Interviewer</h3>
        
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-2 form">
                {!isSignIn && (
                    <FormField
                        control={form.control}
                        name="name"
                        label="Name"
                        placeholder="John Doe"
                    />
                )}
                <FormField
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="you@example.com"
                    type="email"
                />
                <FormField
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="••••••••"
                    type="password"
                />
                <Button className="btn" type="submit">
                    {isSignIn ? "Sign In" : "Create an Account"}
                </Button>
                </form>
            </Form>
            <p className='text-center'>
                {isSignIn ? "Don't have an account? " : "Already have an account? "}
                <Link href={!isSignIn ? "/sign-in" : "/sign-up"} className="font-bold text-user-primary ml-1 underline">
                    {!isSignIn ? "Sign In" : "Sign Up"}
                </Link>
            </p>
        </div>
    </div>
  )
}

export default AuthForm;
