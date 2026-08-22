import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // AI Service Setup
  const genAI = process.env.GEMINI_API_KEY 
    ? new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      })
    : null;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/ai/generate", async (req, res) => {
    if (!genAI) {
      return res.status(503).json({ error: "AI Service not configured" });
    }

    try {
      const { prompt, model = "gemini-3.6-flash" } = req.body;
      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/diagnose-crop", async (req, res) => {
    if (!genAI) {
      return res.status(503).json({ error: "AI Service not configured" });
    }

    try {
      const { image, mimeType = "image/jpeg", notes = "", cropType = "" } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }

      // Clean base64 string
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64Data,
        },
      };

      const promptText = `You are an expert AI Agronomist, Phytopathologist, and Agricultural Quality Inspector.
Analyze this image of agricultural produce or crops.
Detect any potential plant diseases, fungal or bacterial pathogens, pest infestations, nutrient deficiencies, or produce quality/freshness defects.

Return a JSON object strictly matching this schema:
{
  "cropName": "Identified crop or produce name (e.g. Tomato, Bell Pepper, Strawberry, Citrus, Grape, Leafy Green, Apple)",
  "overallHealth": "Healthy" | "Mild Issues Detected" | "Moderate Disease / Infection" | "Severe Infection / Quality Degradation",
  "healthScore": 85,
  "qualityGrade": "Grade A - Export Quality" | "Grade B - Local Market Standard" | "Grade C - Processing / Discount" | "Rejected / Unsalable",
  "diagnosedIssues": [
    {
      "issueName": "Issue name (e.g. Early Blight / Alternaria solani)",
      "category": "Fungal Infection" | "Bacterial Disease" | "Viral Pathogen" | "Pest Damage" | "Nutrient Deficiency" | "Physical Defect / Bruising" | "Environmental Stress",
      "severity": "Low" | "Moderate" | "High" | "Critical",
      "confidence": 94,
      "visualSymptoms": "Clear description of visual markers found in the image."
    }
  ],
  "mitigationStrategies": [
    {
      "type": "Organic / Biological Treatment" | "Chemical / Fungicide Protocol" | "Soil & Irrigation Management" | "Harvest & Post-Harvest Storage",
      "title": "Strategy Title",
      "description": "Actionable step-by-step instructions for the farmer."
    }
  ],
  "marketabilityInsight": "Advice on pricing, sorting, or harvesting timeline.",
  "preventativeAdvice": "Long-term farm practices to prevent future recurrence."
}

Farmer notes: "${notes || "None"}"
Crop hint: "${cropType || "Auto-detect"}"

Return ONLY the JSON string. Do not wrap in markdown syntax.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [imagePart, { text: promptText }]
        },
        config: {
          responseMimeType: "application/json",
        }
      });

      const textResult = response.text || "{}";
      const cleanedJson = textResult.replace(/```json|```/g, "").trim();
      const diagnosticResult = JSON.parse(cleanedJson);

      res.json(diagnosticResult);
    } catch (error: any) {
      console.error("Crop Diagnostic Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze crop image" });
    }
  });

  app.post("/api/ai/seasonal-recipes", async (req, res) => {
    if (!genAI) {
      return res.status(503).json({ error: "AI Service not configured" });
    }

    try {
      const { availableProducts = [], userQuery = "", dietaryPreference = "", mealType = "" } = req.body;

      const productsFormatted = availableProducts.map((p: any) => `- ${p.name} (${p.category}, Origin: ${p.originCountry || 'Global'}${p.isOrganic ? ', Organic' : ''})`).join('\n');

      const promptText = `You are an Executive Farm-to-Table Master Chef and Culinary Nutritionist for FreshWorld Global Marketplace.
The marketplace currently has these fresh seasonal fruits and vegetables in stock:
${productsFormatted || "- Ruby Red Organic Tomatoes\n- Kashmiri Saffron Apples\n- Thai Honey Mangoes\n- Spanish Purple Garlic\n- California Hass Avocados\n- Wild Sicilian Figs\n- Organic Baby Spinach\n- Golden Japanese Sweet Potatoes"}

Task: Craft 4 exquisite, seasonal, farm-to-table gourmet recipes that feature these fresh marketplace ingredients prominently.
${dietaryPreference ? `Dietary Requirement: ${dietaryPreference}` : ''}
${mealType ? `Meal Course Type: ${mealType}` : ''}
${userQuery ? `User Special Request: "${userQuery}"` : ''}

Return ONLY a JSON array of recipe objects strictly adhering to this schema:
[
  {
    "id": "recipe-id-1",
    "title": "Evocative Gourmet Recipe Title",
    "subtitle": "Short 1-sentence culinary summary",
    "prepTime": "15 mins",
    "cookTime": "20 mins",
    "servings": 4,
    "difficulty": "Easy",
    "cuisine": "Mediterranean / Farm-to-Table",
    "mealType": "Dinner",
    "matchedMarketplaceProducts": ["Name of matched product 1", "Name of matched product 2"],
    "pantryIngredients": [
      "2 tbsp Extra virgin olive oil",
      "1 tsp Sea salt"
    ],
    "instructions": [
      "Step 1 instruction...",
      "Step 2 instruction..."
    ],
    "chefTip": "Pro chef secret or beverage pairing tip.",
    "nutrition": {
      "calories": "380 kcal",
      "protein": "9g",
      "carbs": "42g",
      "fiber": "7g"
    }
  }
]

Do NOT wrap response in markdown code fences or backticks. Return valid raw JSON array only.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
        }
      });

      const textResult = response.text || "[]";
      const cleanedJson = textResult.replace(/```json|```/g, "").trim();
      const recipes = JSON.parse(cleanedJson);

      res.json({ recipes });
    } catch (error: any) {
      console.error("Seasonal Recipes Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate seasonal recipes" });
    }
  });

  app.post("/api/ai/translate", async (req, res) => {
    if (!genAI) {
      return res.status(503).json({ error: "AI Service not configured" });
    }

    try {
      const { text, targetLanguage, sourceLanguage = 'English' } = req.body;

      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Missing text or targetLanguage" });
      }

      const promptText = `You are a native professional translator for the FreshWorld Global Agricultural Marketplace.
Translate the following marketplace content accurately and naturally from ${sourceLanguage} to ${targetLanguage}.
Maintain professional, welcoming, and culinary/agricultural tone.
If the input is JSON or an array, keep the exact structure and keys intact, translating only the string values.

Input Content:
${typeof text === 'object' ? JSON.stringify(text) : text}

Return strictly the translated result (if string return text, if JSON return raw JSON without markdown formatting).`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptText,
      });

      const translatedText = response.text || text;
      res.json({ translatedText: translatedText.trim() });
    } catch (error: any) {
      console.error("Translation Gemini Error:", error);
      res.status(500).json({ error: error.message || "Translation failed", translatedText: req.body.text });
    }
  });

  // Example API for Stripe proxying (placeholder for now)
  app.post("/api/create-payment-intent", async (req, res) => {
    // In a real app, you'd use stripe here with process.env.STRIPE_SECRET_KEY
    res.json({ clientSecret: "pi_example_secret" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FreshWorld Server running on http://localhost:${PORT}`);
  });
}

startServer();
