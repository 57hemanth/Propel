import express, { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// Simple authentication token verification middleware
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "karan3";

app.post("/api/login", (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ success: false, error: "Password is required" });
    return;
  }
  
  if (password === ADMIN_PASSWORD) {
    const token = Buffer.from(password).toString("base64");
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: "Incorrect password" });
  }
});

// Middleware to verify authorization token
const authenticateUser = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized access: Please login" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    if (decoded === ADMIN_PASSWORD) {
      next();
    } else {
      res.status(401).json({ success: false, error: "Invalid session token" });
    }
  } catch (e) {
    res.status(401).json({ success: false, error: "Invalid token structure" });
  }
};

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please add it via the Secrets menu in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.post("/api/proposal/generate", authenticateUser, async (req: Request, res: Response) => {
  const {
    clientName,
    serviceCategory,
    description,
    customDeliverables,
    timelineWeeks,
    budget,
    difficultyTone,
    agencyProfile,
  } = req.body;

  if (!clientName || !description) {
    res.status(400).json({ success: false, error: "Client Name and Service Description are required fields." });
    return;
  }

  try {
    const ai = getAiClient();
    
    // Default Agency Profile values if none provided
    const agency = agencyProfile || {
      agencyName: "Karan's Agency",
      founderName: "Karan",
      team: [
        { name: "Karan", role: "Agency Founder & Tech Lead", bio: "Leads technical strategy and product architectures." },
        { name: "Siddharth", role: "Senior UX/UI Product Designer", bio: "Designs intuitive visitor loops and brand aesthetics." },
        { name: "Meera", role: "Lead Full-Stack Engineer", bio: "Develops blazing-fast frontend code and secure API setups." }
      ],
      pricingRange: "$3,000 - $25,000",
      defaultContactEmail: "team@karanagency.com",
      defaultTerms: "50% upfront, 50% upon project completion and launch."
    };

    const teamString = agency.team
      .map((m: any) => `${m.name} (${m.role}): ${m.bio}`)
      .join("\n");

    const systemInstruction = `You are a world-class executive copywriter and agency strategist specializing in drafting highly professional, persuasive, elegant, and action-oriented client proposals.
Your user is ${agency.founderName}, the Founder of "${agency.agencyName}", a fast-moving, design/technology-focused 3-person team.
The team structure consists of exactly 3 individuals:
${teamString}

A key selling point of "${agency.agencyName}" is high speed, premium quality, absolute clarity, and zero bloated enterprise overhead.
Your goal is to write a highly customized first-draft proposal. Keep all content completely factual to the request description without inventing unrelated products. Avoid typical AI fluff, clichés, or excessive jargon. Maintain an elegant, sophisticated human tone.`;

    const userPrompt = `Generate a customized proposal containing a Title, Executive Summary, Key Objectives, Scope and Phase-by-Phase Timeline, Team Structure Allocation, Investment / Pricing Estimate, and simple, Actionable Next Steps.

Project Inputs:
- Client Name: ${clientName}
- Service Concept Requested: ${serviceCategory || "Professional Services"}
- Detailed Description of Needs: ${description}
- Custom Deliverables (if any): ${customDeliverables ? customDeliverables.join(", ") : "Not specified"}
- Suggested Timeline: ${timelineWeeks ? `${timelineWeeks} Weeks` : "To be proposed based on speed & quality"}
- Budget Context: ${budget || "To be estimated in the draft"}
- Tone Alignment Selection: ${difficultyTone || "standard"} (standard, persuasive, technical, or urgent)

Make sure the proposed timeline is split into clear milestones/phases matching a fast timeline. Ensure budget elements are clearly broken down. Maintain absolute professional consistency.`;

    const proposalResponseSchema = {
      type: Type.OBJECT,
      properties: {
        clientName: { type: Type.STRING },
        serviceCategory: { type: Type.STRING },
        title: { type: Type.STRING },
        executiveSummary: { type: Type.STRING },
        keyObjectives: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        scopeTimeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phase: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
              deliverables: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["phase", "duration", "description", "deliverables"]
          }
        },
        teamStructureText: { type: Type.STRING },
        pricingEstimate: {
          type: Type.OBJECT,
          properties: {
            total: { type: Type.STRING },
            details: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  amount: { type: Type.STRING }
                },
                required: ["task", "amount"]
              }
            }
          },
          required: ["total", "details"]
        },
        whyOurAgency: { type: Type.STRING },
        nextSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: [
        "clientName",
        "serviceCategory",
        "title",
        "executiveSummary",
        "keyObjectives",
        "scopeTimeline",
        "teamStructureText",
        "pricingEstimate",
        "whyOurAgency",
        "nextSteps"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: proposalResponseSchema,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error("No response content generated by Gemini.");
    }

    const proposalData = JSON.parse(response.text.trim());
    res.json({ success: true, proposal: proposalData });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred during proposal generation."
    });
  }
});

export default app;
