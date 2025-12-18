import { GoogleGenAI, Type } from "@google/genai";

// Helper to get client safely
const getAiClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey || apiKey.includes('PUT_YOUR_KEY')) {
    throw new Error("Chave API do Gemini não configurada ou inválida. Verifique o arquivo .env");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to strip "data:image/xyz;base64," prefix if present
const cleanBase64 = (base64Str: string) => {
    const base64Pattern = /^data:image\/(png|jpeg|jpg|webp|heic|heif);base64,/;
    if (base64Pattern.test(base64Str)) {
        return base64Str.replace(base64Pattern, '');
    }
    return base64Str;
};

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  isMasking: boolean = false
): Promise<string> => {
  try {
    const cleanData = cleanBase64(base64ImageData);
    
    // Using gemini-2.0-flash-001
    const model = 'gemini-2.0-flash-001';

    const fullPrompt = isMasking 
        ? `Edit this image. Identify the area marked with red color. Remove the object or defect in that red area and fill it in seamlessly with the surrounding background texture and lighting. ${prompt}. Return the edited image.`
        : `Edit this image: ${prompt}. Return the edited image as output.`;

    let contents: any = {
        parts: [
            {
                inlineData: {
                    data: cleanData,
                    mimeType: mimeType,
                },
            },
            {
                text: fullPrompt
            }
        ]
    };

    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model,
        contents,
    });

    console.log("API Response:", response);

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            // Check for inline data (image)
            if (part.inlineData) {
                const responseMime = part.inlineData.mimeType || 'image/png';
                return `data:${responseMime};base64,${part.inlineData.data}`;
            }
            // Check for text response that might contain base64
            if (part.text) {
                console.log("Text response:", part.text.substring(0, 200));
            }
        }
    }

    // If no image found, throw descriptive error
    throw new Error("O modelo retornou uma resposta de texto em vez de imagem. O Gemini 2.0 pode não suportar edição de imagens diretamente. Tente usar as ferramentas mágicas em vez da edição livre.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Better error messages
    if (error?.status === 'RESOURCE_EXHAUSTED') {
        throw new Error("Limite de requisições atingido. Aguarde alguns segundos e tente novamente.");
    }
    if (error?.status === 'NOT_FOUND') {
        throw new Error("Modelo não encontrado. Verifique se sua chave API está correta.");
    }
    if (error?.message?.includes("não suportar edição")) {
        throw error;
    }
    throw new Error(error?.message || "Erro ao processar imagem com IA");
  }
};

export interface MarketingCopyResult {
  short: string;
  engagement: string;
  sales: string;
  colorPalette: string[];
  emojiSuggestions: string[];
}

export const generateMarketingCopy = async (
    base64ImageData: string,
    mimeType: string,
    context: string,
    targetAudience: string
): Promise<MarketingCopyResult> => {
    const cleanData = cleanBase64(base64ImageData);
    
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-001",
            contents: {
                parts: [
                    { inlineData: { data: cleanData, mimeType } },
                    { text: `Act as an expert marketing copywriter. Analyze this image.
                      Context provided by user: ${context}.
                      Target Audience: ${targetAudience}.
                      
                      Generate marketing assets in JSON format with these fields:
                      - short: A short, punchy caption for Instagram (under 100 chars)
                      - engagement: An engaging question or conversation starter
                      - sales: A persuasive sales pitch focused on benefits
                      - colorPalette: Array of 3-5 hex color codes from the image
                      - emojiSuggestions: Array of 5 relevant emojis` }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        short: { type: Type.STRING },
                        engagement: { type: Type.STRING },
                        sales: { type: Type.STRING },
                        colorPalette: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING }
                        },
                        emojiSuggestions: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["short", "engagement", "sales", "colorPalette", "emojiSuggestions"]
                }
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("Nenhum texto foi gerado");
        
        return JSON.parse(text) as MarketingCopyResult;
    } catch (error: any) {
        console.error("Marketing Copy Error:", error);
        
        if (error?.status === 'RESOURCE_EXHAUSTED') {
            throw new Error("Limite de requisições atingido. Aguarde alguns segundos e tente novamente.");
        }
        if (error?.status === 'NOT_FOUND') {
            throw new Error("Modelo não encontrado. Verifique se sua chave API está correta.");
        }
        throw error;
    }
}