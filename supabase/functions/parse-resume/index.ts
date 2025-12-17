// // Remove the old import. Deno.serve is built-in now.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // 1. Log immediately to confirm function was hit
  console.log(`[DEBUG] Request received: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Debug the JSON parsing
    let resumeText = "";
    try {
      const body = await req.json();
      resumeText = body.resumeText;
      console.log(`[DEBUG] JSON Body parsed. Resume length: ${resumeText?.length || 0}`);
    } catch (e) {
      console.error("[ERROR] Failed to parse request JSON:", e);
      throw new Error("Invalid JSON body. Make sure you are sending { resumeText: '...' }");
    }

    if (!resumeText) throw new Error("resumeText is missing in the request body");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("[ERROR] Missing GEMINI_API_KEY env var");
      throw new Error("Server configuration error: API Key missing");
    }

    console.log("[DEBUG] Sending request to Gemini...");

    // 3. The Safe Schema (prevents 400 Bad Request)
    const schema = {
      type: "object",
      properties: {
        full_name: { type: "string", nullable: true },
        email: { type: "string", nullable: true },
        phone: { type: "string", nullable: true },
        location: { type: "string", nullable: true },
        skills: { type: "array", items: { type: "string" } },
        total_experience: { type: "string", nullable: true },
        links: {
          type: "array",
          items: {
            type: "object",
            properties: {
              link_name: { type: "string", nullable: true },
              link_url: { type: "string", nullable: true }
            }
          }
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              institution: { type: "string", nullable: true },
              degree: { type: "string", nullable: true },
              year: { type: "string", nullable: true }
            }
          }
        },
        employment_history: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string", nullable: true },
              title: { type: "string", nullable: true },
              duration: { type: "string", nullable: true }
            }
          }
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", nullable: true },
              description: { type: "string", nullable: true },
              tools: { type: "string", nullable: true }
            }
          }
        },
        summary: { type: "string", nullable: true },
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `Extract data from this resume. Return null for missing fields. \nRESUME:\n${resumeText}` }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      }
    );

    console.log(`[DEBUG] Gemini HTTP Status: ${response.status}`);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ERROR] Gemini API Refusal: ${errText}`);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[DEBUG] Gemini response received & parsed");

    const parsedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedText) throw new Error("AI returned empty content");

    const parsedJSON = JSON.parse(parsedText);

    return new Response(
      JSON.stringify({ success: true, data: parsedJSON }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[CRITICAL ERROR CAUGHT]:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

