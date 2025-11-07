import { GoogleGenAI, Modality } from "@google/genai";

export const editImageWithGemini = async (imageFile: File, prompt: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const imagePart = {
        inlineData: {
            data: await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result.split(',')[1]);
                    } else {
                        reject(new Error('Failed to read file as base64 string.'));
                    }
                };
                reader.onerror = error => reject(error);
                reader.readAsDataURL(imageFile);
            }),
            mimeType: imageFile.type,
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("API did not return an image. The prompt might have been blocked.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to edit image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while editing the image.");
    }
};
