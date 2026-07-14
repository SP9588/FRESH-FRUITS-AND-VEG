import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AuditResult {
  confidenceScore: number;
  flags: string[];
  summary: string;
}

export async function auditSellerApplication(sellerData: any): Promise<AuditResult> {
  try {
    const prompt = `
      Perform a security and authenticity audit for a global food marketplace seller registration.
      Analyze the following business data for inconsistencies, fraud patterns, or missing critical info.
      
      Business Info:
      Name: ${sellerData.businessName}
      Farm: ${sellerData.farmName}
      Type: ${sellerData.type}
      Location: ${sellerData.city}, ${sellerData.country} (${sellerData.address})
      Contact: ${sellerData.phone}
      
      Response must be strict JSON in this format:
      {
        "confidenceScore": (0-100),
        "flags": ["list", "of", "risk", "warnings"],
        "summary": "one sentence audit summary"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    
    // Clean up potential markdown formatting from Gemini
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Audit failed:", error);
    return {
      confidenceScore: 0,
      flags: ["System Error", "Audit incomplete due to API failure"],
      summary: "AI Audit service was unreachable. Manual review required."
    };
  }
}
