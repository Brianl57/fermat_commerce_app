
export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    rating: number;
    inStock: boolean;
    imageUrl: string;
    tags?: string[];

    // returned by backend for "Most popular" sort + indicator
    popularity?: number;
};
