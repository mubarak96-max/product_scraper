// types/index.ts
export interface ProductData {
    title: string;
    description: string;
    features: string[];
    reviews: {
        name: string;
        rating: number;
        review: string;
        imagePrompt: string;
    }[];
}

export interface ApiResponse {
    success: boolean;
    data?: ProductData;
    error?: string;
}