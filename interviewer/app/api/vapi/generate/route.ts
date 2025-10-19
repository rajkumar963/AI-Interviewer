// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";

// import { db } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";

// export async function POST(request: Request) {
//   const { type, role, level, techstack, amount, userid } = await request.json();

//   try {
//     const { text: questions } = await generateText({
//       model: google("gemini-2.0-flash-001"),
//       prompt: `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]
        
//         Thank you! <3
//     `,
//     });

//     const interview = {
//       role: role,
//       type: type,
//       level: level,
//       techstack: techstack.split(","),
//       questions: JSON.parse(questions),
//       userId: userid,
//       finalized: true,
//       coverImage: getRandomInterviewCover(),
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("interviews").add(interview);

//     return Response.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Error:", error);
//     return Response.json({ success: false, error: error }, { status: 500 });
//   }
// }

// export async function GET() {
//   return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
// }



import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
      maxRetries: 1, // Reduce retries to fail faster
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    
    // Handle quota errors specifically
    if (error.message?.includes('quota') || 
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.lastError?.statusCode === 429) {
      
      console.log('Using fallback questions due to API quota limits');
      
      try {
        const fallbackQuestions = generateFallbackQuestions(type, role, level, techstack, amount);
        
        const interview = {
          role: role,
          type: type,
          level: level,
          techstack: techstack.split(","),
          questions: fallbackQuestions,
          userId: userid,
          finalized: true,
          coverImage: getRandomInterviewCover(),
          createdAt: new Date().toISOString(),
        };

        await db.collection("interviews").add(interview);

        return Response.json({ 
          success: true, 
          message: "Used fallback questions due to API limits" 
        }, { status: 200 });
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return Response.json({ 
          success: false, 
          error: "API quota exceeded and fallback failed" 
        }, { status: 500 });
      }
    }
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Fallback question generator
function generateFallbackQuestions(type: string, role: string, level: string, techstack: string, amount: number): string[] {
  const baseQuestions = {
    behavioral: [
      "Tell me about yourself and your professional background.",
      "What interests you about this role and our company?",
      "Describe a challenging work situation and how you overcame it.",
      "How do you handle tight deadlines and pressure?",
      "Tell me about a time you had a conflict with a team member and how you resolved it.",
      "What is your greatest strength and how does it apply to this role?",
      "Where do you see yourself in 5 years?",
      "Describe a project you're particularly proud of and why.",
      "How do you handle receiving critical feedback?",
      "What motivates you in your work?",
      "Tell me about a time you failed and what you learned from it.",
      "How do you prioritize your tasks when working on multiple projects?",
      "Describe your ideal work environment.",
      "How do you stay organized and manage your time?",
      "Why are you leaving your current position?"
    ],
    
    technical: [
      "What technical skills are most relevant to this role?",
      "Describe your experience with our tech stack.",
      "How do you approach debugging complex issues?",
      "What development methodologies do you prefer and why?",
      "Describe your experience with version control systems.",
      "How do you ensure code quality in your projects?",
      "What is your experience with testing and quality assurance?",
      "How do you stay updated with new technologies?",
      "Describe a technical challenge you faced and how you solved it.",
      "What programming languages are you most comfortable with?",
      "How do you approach technical documentation?",
      "Describe your experience with database design and management.",
      "What is your experience with cloud platforms?",
      "How do you handle security considerations in your work?",
      "What tools do you use for project management and collaboration?"
    ]
  };

  // Mix questions based on type preference
  let selectedQuestions: string[] = [];
  
  if (type.toLowerCase().includes('behavioral')) {
    selectedQuestions = [...baseQuestions.behavioral];
  } else if (type.toLowerCase().includes('technical')) {
    selectedQuestions = [...baseQuestions.technical];
  } else {
    // Mixed - combine both
    selectedQuestions = [
      ...baseQuestions.behavioral.slice(0, Math.ceil(baseQuestions.behavioral.length / 2)),
      ...baseQuestions.technical.slice(0, Math.ceil(baseQuestions.technical.length / 2))
    ];
  }

  // Add role-specific questions
  const roleSpecificQuestions = getRoleSpecificQuestions(role, level, techstack);
  selectedQuestions = [...selectedQuestions, ...roleSpecificQuestions];

  // Shuffle and take the requested amount
  selectedQuestions = shuffleArray(selectedQuestions).slice(0, parseInt(amount.toString()) || 8);

  return selectedQuestions;
}

function getRoleSpecificQuestions(role: string, level: string, techstack: string): string[] {
  const roleQuestions: { [key: string]: string[] } = {
    'software engineer': [
      "How do you approach code reviews?",
      "What is your experience with agile development?",
      "How do you handle technical debt?",
      "Describe your experience with CI/CD pipelines.",
      "What is your approach to system design?",
      "How do you mentor junior developers?"
    ],
    'frontend developer': [
      "What is your experience with responsive design?",
      "How do you optimize web performance?",
      "Describe your experience with modern JavaScript frameworks.",
      "How do you handle cross-browser compatibility?",
      "What is your approach to web accessibility?"
    ],
    'backend developer': [
      "Describe your experience with API design.",
      "How do you handle database optimization?",
      "What is your experience with microservices?",
      "How do you ensure application scalability?",
      "Describe your experience with system architecture."
    ],
    'fullstack developer': [
      "How do you balance frontend and backend responsibilities?",
      "What is your experience with end-to-end application development?",
      "How do you ensure consistency across the entire stack?",
      "Describe your experience with deployment and DevOps."
    ],
    'product manager': [
      "How do you prioritize product features?",
      "Describe your experience with user research.",
      "How do you work with engineering teams?",
      "What metrics do you track for product success?",
      "How do you handle stakeholder management?"
    ],
    'data scientist': [
      "Describe your experience with machine learning models.",
      "How do you approach data cleaning and preprocessing?",
      "What is your experience with data visualization?",
      "How do you validate your models?",
      "Describe your experience with big data technologies."
    ]
  };

  // Add level-specific questions
  const levelQuestions: { [key: string]: string[] } = {
    'junior': [
      "What are you looking to learn in this role?",
      "How do you handle tasks that are new to you?",
      "What kind of mentorship are you seeking?"
    ],
    'senior': [
      "How do you mentor junior team members?",
      "Describe your experience leading technical projects.",
      "How do you influence technical strategy?",
      "What is your approach to architectural decisions?"
    ],
    'lead': [
      "How do you build and manage high-performing teams?",
      "Describe your experience with technical leadership.",
      "How do you align technical and business goals?",
      "What is your approach to project planning and delivery?"
    ]
  };

  const questions: string[] = [];
  
  // Add role-specific questions
  const roleKey = Object.keys(roleQuestions).find(key => 
    role.toLowerCase().includes(key)
  );
  if (roleKey) {
    questions.push(...roleQuestions[roleKey]);
  }

  // Add level-specific questions
  const levelKey = Object.keys(levelQuestions).find(key => 
    level.toLowerCase().includes(key)
  );
  if (levelKey) {
    questions.push(...levelQuestions[levelKey]);
  }

  // Add tech stack specific questions
  if (techstack) {
    const techs = techstack.split(',').map(tech => tech.trim());
    techs.forEach(tech => {
      questions.push(`What is your experience with ${tech}?`);
      questions.push(`How would you approach learning ${tech} if needed?`);
    });
  }

  return questions;
}

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}