// types/index.ts
export interface ProductData {
    title: string;
    description: string;
    features: string[];
}

export interface ApiResponse {
    success: boolean;
    data?: ProductData;
    error?: string;
}