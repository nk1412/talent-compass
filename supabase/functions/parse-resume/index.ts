import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, fileName } = await req.json();
    
    if (!resumeText) {
      return new Response(
        JSON.stringify({ error: 'No resume text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Parsing resume:', fileName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert CV/resume parser. Extract structured information from resumes accurately. 
            Always respond with valid JSON matching this exact schema:
            {
              "fullName": "string",
              "email": "string",
              "phone": "string",
              "location": "string",
              "totalExperience": number (years as integer),
              "skills": ["string array of skills"],
              "education": [{"institution": "string", "degree": "string", "field": "string", "graduationYear": number}],
              "employmentHistory": [{"company": "string", "position": "string", "startDate": "string (YYYY-MM)", "endDate": "string or null", "current": boolean}],
              "source": "Resume Upload"
            }
            If a field cannot be determined, use null for strings, 0 for numbers, or empty arrays.`
          },
          {
            role: 'user',
            content: `Parse this resume and extract all relevant information:\n\n${resumeText}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_candidate_info',
              description: 'Extract structured candidate information from a resume',
              parameters: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', description: 'Full name of the candidate' },
                  email: { type: 'string', description: 'Email address' },
                  phone: { type: 'string', description: 'Phone number' },
                  location: { type: 'string', description: 'City, State/Country' },
                  totalExperience: { type: 'integer', description: 'Total years of experience' },
                  skills: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'List of technical and soft skills'
                  },
                  education: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        institution: { type: 'string' },
                        degree: { type: 'string' },
                        field: { type: 'string' },
                        graduationYear: { type: 'integer' }
                      },
                      required: ['institution', 'degree', 'field', 'graduationYear']
                    }
                  },
                  employmentHistory: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        company: { type: 'string' },
                        position: { type: 'string' },
                        startDate: { type: 'string' },
                        endDate: { type: 'string' },
                        current: { type: 'boolean' }
                      },
                      required: ['company', 'position', 'startDate', 'current']
                    }
                  }
                },
                required: ['fullName', 'email', 'skills', 'education', 'employmentHistory']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_candidate_info' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the parsed data from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call response from AI');
    }

    const parsedData = JSON.parse(toolCall.function.arguments);
    parsedData.source = 'Resume Upload';

    console.log('Successfully parsed resume for:', parsedData.fullName);

    return new Response(
      JSON.stringify({ success: true, data: parsedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error parsing resume:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse resume';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
