import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/dist/client/link'
import Image from 'next/image'
import { dummyInterviews } from '@/constants'
import InterviewCard from '@/components/InterviewCard'

const page = () => {
  return (
    <>
      <section className='card-cta'>
         <div className='flex flex-col gap-4 max-w-lg'>
           <h2>Get Interview Ready with AI-Powered Practice & Feedback</h2>
           <p className='text-lg'>Practice on real interview questions and get instant feedback from our AI-powered system</p>

           <Button asChild className='btn-primary max-sm:w-full'>
            <Link href="/interview">Start an Interview</Link>
           </Button>
         </div>

         <Image src="/robot.png" alt="Interview Illustration" width={400} height={400} className='max-sm:hidden' />
      </section>

      <section className='flex flex-col gap-4 mt-5'>
        <h2>Your Interviews</h2>
        <div className='interviews-section'>
          {/* <p>You haven&apos;t taken any interviews yet.</p> */}
          {dummyInterviews.map((interview) => (
            <InterviewCard key={interview.id}{...interview} />
            ))
          }
        </div>
      </section>

      <section className='flex flex-col gap-4 mt-5'>
        <h2>Take an Interview</h2>
        <div className='interviews-section'>
          {dummyInterviews.map((interview) => (
            <InterviewCard key={interview.id}{...interview} />
            ))
          }
          {/* <p>You haven&apos;t taken any interviews yet.</p> */}
        </div>
      </section>
    </>
  )
}

export default page