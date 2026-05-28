const { GoogleGenerativeAI } = require('@google/generative-ai');

const getMockQuestions = (jobTitle, difficulty) => {
  return [
    {
      text: `Can you describe your experience working with core technologies related to ${jobTitle || 'this role'} and how you keep up with changes?`,
      type: 'Technical',
      sampleAnswer: 'The candidate should explain their technical stack, mention learning resources, and detail recent libraries/frameworks they studied.'
    },
    {
      text: 'Tell me about a challenging technical problem you solved. What was the impact and what did you learn?',
      type: 'Scenario',
      sampleAnswer: 'The response should use the STAR method: Situation, Task, Action, and Result, focusing on architectural decisions.'
    },
    {
      text: 'Describe a situation where you had a conflict with a teammate or stakeholder. How did you resolve it?',
      type: 'Behavioral',
      sampleAnswer: 'The response should show high EQ, communication skill, compromise, and a professional attitude to consensus building.'
    },
    {
      text: 'How do you prioritize tasks when working under tight deadlines with shifting requirements?',
      type: 'Behavioral',
      sampleAnswer: 'The candidate should outline prioritization frameworks (e.g. Eisenhower Matrix), stakeholder communication, and agility.'
    },
    {
      text: `Design a scalable notification service that can handle millions of events daily. What trade-offs would you make?`,
      type: 'Scenario',
      sampleAnswer: 'The response should detail queueing, pub-sub architectures (Kafka/SQS), database choices, and handling retries/throttling.'
    }
  ];
};

// Helper to generate mock evaluation for local/offline developer flow
const getMockEvaluation = (jobTitle, questions) => {
  const evaluations = questions.map((q) => {
    const ans = (q.userAnswer || '').trim().toLowerCase();
    let score = 0;
    let feedback = '';

    if (!ans || ans === '[skipped/no response]') {
      score = 0;
      feedback = 'No answer recorded. The question was skipped.';
    } else if (ans.length < 15 || ans.includes("don't know") || ans.includes("dont know") || ans.includes("no idea") || ans.includes("failed contacting")) {
      score = Math.floor(Math.random() * 15) + 15; // 15-30
      feedback = 'The response was extremely brief or indicated lack of knowledge. Please provide a detailed answer with examples.';
    } else if (ans.length < 50) {
      score = Math.floor(Math.random() * 20) + 45; // 45-65
      feedback = 'Solid initial thought, but the answer lacks technical depth and structure. Try to use the STAR method to describe experiences.';
    } else {
      score = Math.floor(Math.random() * 20) + 75; // 75-95
      feedback = 'Excellent overview! The response was detailed, well-structured, and demonstrated good understanding of the role.';
    }

    return {
      questionId: q._id ? q._id.toString() : null,
      questionText: q.text,
      userAnswer: q.userAnswer || 'No response provided.',
      score,
      feedback,
      betterSampleAnswer: q.sampleAnswer
    };
  });

  const validScores = evaluations.filter(e => e.score > 0).map(e => e.score);
  const overallScore = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

  return {
    overallScore,
    hiringRecommendation: overallScore >= 80 ? 'Strong Hire' : overallScore >= 70 ? 'Hire' : overallScore >= 50 ? 'Borderline' : 'No Hire',
    summary: `The candidate showed standard understanding of the ${jobTitle} role. Technical depth was moderate, with opportunities for improvement in system design details.`,
    strengths: [
      'Structured answers utilizing STAR pattern',
      'Solid high-level conceptual clarity',
      'Honest communication about limits of experience'
    ],
    weaknesses: [
      'Missing low-level coding implementation details',
      'Could use more quantitative metrics in outcomes',
      'Needs closer alignment with scalable design patterns'
    ],
    recommendations: [
      'Study system design distributed systems architectures',
      'Practice whiteboard coding questions under tight timing constraints',
      'Include business metrics (costs saved, performance increased) in answers'
    ],
    questionEvaluations: evaluations
  };
};

/**
 * Generates 5-6 questions using Gemini API or mock data
 */
const generateQuestions = async (jobTitle, jobDescription, yearsOfExperience, skills, resumeText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Falling back to mock questions.');
    return getMockQuestions(jobTitle);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert technical interviewer.
Generate exactly 5 to 6 questions for a candidate based on:
- Job Title: ${jobTitle}
- Job Description: ${jobDescription || 'N/A'}
- Experience Level: ${yearsOfExperience} years
- Skills Required: ${skills ? skills.join(', ') : 'General software engineering'}
- Candidate Resume (if available): ${resumeText || 'No resume uploaded.'}

The questions must include:
- Technical questions (probing specific core skills)
- Behavioral questions (assessing culture, communication)
- Scenario-based questions (design, architecture, or coding challenge scenarios)

Return ONLY a JSON array containing objects with the following keys:
- "text": The question string
- "type": MUST be one of: "Technical", "Behavioral", "Scenario"
- "sampleAnswer": Brief outline of what a model high-quality answer should include.

Ensure the output is valid JSON and nothing else.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini question generation error:', error);
    return getMockQuestions(jobTitle);
  }
};

/**
 * Evaluates candidate responses using Gemini API or mock data
 */
const evaluateInterview = async (jobTitle, jobDescription, yearsOfExperience, questions, resumeText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Falling back to mock evaluation.');
    return getMockEvaluation(jobTitle, questions);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const qaList = questions.map((q, idx) => `
Question ID: ${q._id ? q._id.toString() : idx}
Question ${idx + 1}: ${q.text}
Type: ${q.type}
Candidate Answer: ${q.userAnswer || '[Skipped/No response]'}
Ideal Answer Guide: ${q.sampleAnswer}
`).join('\n');

    const prompt = `You are an elite, highly strict technical interviewer and evaluator.
Evaluate the candidate's answers for a ${jobTitle} position (${yearsOfExperience} years of experience required).
Job Description: ${jobDescription || 'N/A'}
Candidate Resume Context (if available): ${resumeText || 'No resume uploaded.'}

Here are the questions asked and the candidate's transcribed responses:
${qaList}

Please analyze their performance on:
1. Technical accuracy: Check if the spoken/written text actually answers the question correctly.
2. Communication clarity, confidence, and structure.
3. Relevant experiences and examples provided.
4. Problem-solving approach.

STRICT SCORING INSTRUCTIONS:
- You must grade candidate responses strictly. If the answer is extremely brief (e.g. one-sentence), generic, incorrect, irrelevant, or indicates "I don't know" or has STT fallback text, assign a low score (e.g., 0 to 45).
- If the answer is completely empty, skipped, or missing, assign a score of 0.
- Only assign a high score (75-100) if the candidate's response shows deep technical competence, detailed understanding, and aligns well with the Ideal Answer Guide.
- Ensure the overallScore is the average of individual question scores.

Return ONLY a JSON object with the following structure:
{
  "overallScore": number (0 to 100, must be the average of the question scores),
  "hiringRecommendation": "Strong Hire" | "Hire" | "Borderline" | "No Hire",
  "summary": "High-level summary of the candidate's overall performance",
  "strengths": ["list of 3 key strengths"],
  "weaknesses": ["list of 3 key weaknesses/gaps"],
  "recommendations": ["list of 3 actionable study/practice improvements"],
  "questionEvaluations": [
    {
      "questionId": "the exact Question ID provided above",
      "questionText": "exact question text",
      "userAnswer": "exact user answer",
      "score": number (0 to 100 score for this question based on correctness),
      "feedback": "detailed explanation of what was good and what was missing in their answer",
      "betterSampleAnswer": "a professional-grade answer that would score 100% on this question"
    }
  ]
}

Ensure the output is valid JSON and nothing else.`;

    console.log('--- SENDING EVALUATION PROMPT TO GEMINI ---');
    console.log(prompt);
    console.log('-------------------------------------------');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini interview evaluation error:', error);
    return getMockEvaluation(jobTitle, questions);
  }
};

module.exports = { generateQuestions, evaluateInterview };
