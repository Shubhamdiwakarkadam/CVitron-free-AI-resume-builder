/**
 * AI Integration Module - Handles Gemini API requests and Mock Responses
 */

const AI = {
  // Retrieve saved API configuration
  getApiKey: () => {
    return localStorage.getItem('gemini_api_key') || '';
  },

  isMockMode: () => {
    const mock = localStorage.getItem('gemini_mock_mode');
    return mock === null ? true : mock === 'true'; // Defaults to mock mode
  },

  // Base API Call to Gemini API
  async generateContent(prompt, systemInstruction = '') {
    const isMock = this.isMockMode();
    const key = this.getApiKey();

    if (isMock) {
      console.log('Running in Mock Mode. Prompt:', prompt);
      // Give a tiny simulated delay for UX realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      return null; // Will fallback to custom mock response generators
    }

    if (!key) {
      throw new Error('Gemini API key is not configured. Please configure it in Settings or enable Mock Mode.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `API error (${response.status})`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Received empty response from Gemini API.');
      }

      return text;
    } catch (error) {
      console.error('Gemini API Call Failed:', error);
      throw error;
    }
  },

  // 1. ATS Score Checker
  async checkATSCompatibility(resumeText, jobDescription) {
    const systemPrompt = `You are a professional recruiting coordinator and Applicant Tracking System (ATS) parser. 
Analyze the candidate's resume content against the job description.
Return a JSON object ONLY. Do not write any markdown wrappers (like \`\`\`json) or extra text.
Format the JSON exactly like this schema:
{
  "score": 75,
  "summary": "Short paragraph summarizing the overall match quality.",
  "matchedKeywords": ["React", "CSS3", "JavaScript"],
  "missingKeywords": ["Docker", "TypeScript", "CI/CD"],
  "bulletSuggestions": [
    "In Experience 1, rewrite 'Worked on frontend code' to: 'Architected and built reusable React components and state management, increasing render performance by 15%.'"
  ]
}`;

    const prompt = `RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

    if (this.isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 1800));
      // Extract keywords dynamically to make the mock look realistic
      const mockKeywords = ['JavaScript', 'HTML5', 'CSS3', 'React', 'Node.js', 'Git', 'REST APIs', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'TypeScript', 'CI/CD'];
      const matched = mockKeywords.filter(kw => resumeText.toLowerCase().includes(kw.toLowerCase()));
      const missing = mockKeywords.filter(kw => !resumeText.toLowerCase().includes(kw.toLowerCase()) && jobDescription.toLowerCase().includes(kw.toLowerCase())).slice(0, 4);
      
      // Calculate a pseudo-score
      const score = Math.min(95, Math.max(30, Math.floor(40 + (matched.length * 7) - (missing.length * 3))));
      
      return {
        score: score,
        summary: `The resume demonstrates a strong match for ${matched.length} core technical requirements, but could be improved by explicitly highlighting experience with missing keys like ${missing.length > 0 ? missing.join(', ') : 'CI/CD pipelines'} in your experience bullet points.`,
        matchedKeywords: matched.length > 0 ? matched : ['JavaScript', 'HTML5', 'CSS'],
        missingKeywords: missing.length > 0 ? missing : ['TypeScript', 'Docker', 'CI/CD'],
        bulletSuggestions: [
          "Rewrite your latest work description to include quantitative metrics (e.g., 'reduced render load by 20%').",
          "Ensure your tools section lists all the core development packages matching the requirements directly.",
          `Highlight any projects involving ${missing.length > 0 ? missing[0] : 'modern containerization tools'} to increase compliance.`
        ]
      };
    }

    const responseText = await this.generateContent(prompt, systemPrompt);
    try {
      // Clean potential JSON markdown blocks if Gemini outputs them
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON. Raw response:', responseText);
      throw new Error('Failed to analyze resume. The AI output was not in the expected JSON format.');
    }
  },

  // 2. Cover Letter Generator
  async generateCoverLetter(resumeText, company, role, jobDescription = '') {
    const prompt = `You are a professional cover letter writer. 
Write a highly targeted, persuasive cover letter for:
Company: ${company}
Job Title/Role: ${role}

Candidate Resume Context:
${resumeText}

Additional Job Requirements (if provided):
${jobDescription}

INSTRUCTIONS:
Write a elegant, professional, 3-to-4 paragraph cover letter.
Start with a formal layout (date, placeholder company address), professional salutation, greeting, strong opening hook, core match description emphasizing achievements from the resume, and a collaborative call to action at the end.
Do not use markdown bolding or styling, output plain text with double line-breaks between paragraphs so it is directly readable and editable on a formal letter document.`;

    if (this.isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${role} position at ${company}. With a proven background in software engineering and hands-on experience designing robust application workflows, I am confident in my ability to make a meaningful impact on your engineering division.

In reviewing your requirements, I was thrilled to see a close alignment with my qualifications. In my current role, I have repeatedly succeeded in writing clean, scalable code and delivering high-impact features under schedule constraints. I pride myself on not just solving complex technical challenges, but also aligning our codebases with immediate business demands.

I am particularly excited about ${company}'s current trajectory and reputation for tech innovation. I would welcome the opportunity to discuss how my background and technical skills match the requirements of the ${role} role.

Thank you for your time and consideration.

Sincerely,
[Your Name]`;
    }

    return await this.generateContent(prompt);
  },

  // 3. AI Bullet Enhancer
  async enhanceParagraph(text, tone, keywords = '') {
    let instruction = '';
    if (tone === 'star') {
      instruction = 'Rewrite the text using the STAR method (Situation, Task, Action, Result). Highlight specific actions taken and quantify the outcomes/results where possible. Make it action-oriented using active verbs.';
    } else if (tone === 'confident') {
      instruction = 'Rewrite the text to sound highly competent, authoritative, and achievement-driven. Emphasize leadership, problem-solving, and ownership.';
    } else if (tone === 'concise') {
      instruction = 'Rewrite the text to be extremely clear and concise. Strip out fluff and wordy sentences while preserving the core impact.';
    } else {
      instruction = 'Rewrite the text to be professional, technical, and academic. Use accurate industry terms and standard technical descriptions.';
    }

    if (keywords) {
      instruction += ` Ensure you naturally incorporate these keywords/technologies: ${keywords}.`;
    }

    const systemPrompt = `You are a professional resume consultant. ${instruction}
Output ONLY the rewritten text/bullet point. Do not add any introductory text, quotes, or concluding remarks. Just output the result.`;

    if (this.isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const keywordsArray = keywords ? keywords.split(',') : [];
      const injectKeywords = keywordsArray.length > 0 ? ` utilizing ${keywordsArray.join(' and ')}` : '';
      
      if (tone === 'star') {
        return `Spearheaded the optimization of legacy modules${injectKeywords}, reducing system rendering lag by 24% and resulting in a 15% increase in user retention.`;
      } else if (tone === 'confident') {
        return `Architected and successfully deployed next-generation system infrastructure${injectKeywords}, establishing code standards that cut system crashes by 40% and improved team velocity.`;
      } else if (tone === 'concise') {
        return `Optimized legacy codebases${injectKeywords}, reducing render latency by 24% and improving performance.`;
      } else {
        return `Implemented systematic optimizations in application source code${injectKeywords}, maximizing execution efficiency and enhancing runtime performance metric thresholds.`;
      }
    }

    return await this.generateContent(text, systemPrompt);
  }
};
