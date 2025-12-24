import { getProducts } from "../repositories/products.repo";

export type ListProductsInput = {
    q?: string;
    category?: string[];
    brand?: string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string; // later: union type
};

export async function listProducts(input: ListProductsInput) {
    return getProducts(input);
}
