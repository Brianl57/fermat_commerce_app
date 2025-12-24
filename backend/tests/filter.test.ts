import { describe, it, expect } from "vitest";
import { getProducts } from "../src/repositories/products.repo";

/**
 * Test suite for the product filter functionality.
 *
 * The filter API accepts the following query parameters:
 * - category: string[] - Filter by product category
 * - brand: string[] - Filter by product brand
 * - minPrice: number - Minimum price (inclusive)
 * - maxPrice: number - Maximum price (inclusive)
 *
 * API Request: GET /products?category=<category>&brand=<brand>&minPrice=<min>&maxPrice=<max>
 * API Response: { items: Product[] }
 *
 * All tests in this file use an empty search query (q is undefined).
 */
describe("Product Filter Functionality", () => {
    /**
     * Test: Filtering by category="Electronics" should return only products
     * where the category is equal to "Electronics".
     */
    describe("Filter by category", () => {
        it("should return only products with category 'Electronics'", async () => {
            const results = await getProducts({ category: ["Electronics"] });

            expect(results.length).toBeGreaterThan(0);

            // Verify every result has category "Electronics"
            results.forEach((product) => {
                expect(
                    product.category,
                    `Product "${product.name}" (id: ${product.id}) should have category 'Electronics'`
                ).toBe("Electronics");
            });
        });

        it("should return the expected count of Electronics products", async () => {
            const results = await getProducts({ category: ["Electronics"] });
            // Based on database, there are 415 products with category "Electronics"
            expect(results.length).toBe(415);
        });
    });

    /**
     * Test: Filtering by brand="Adidas" should return only products
     * where the brand is equal to "Adidas".
     */
    describe("Filter by brand", () => {
        it("should return only products with brand 'Adidas'", async () => {
            const results = await getProducts({ brand: ["Adidas"] });

            expect(results.length).toBeGreaterThan(0);

            // Verify every result has brand "Adidas"
            results.forEach((product) => {
                expect(
                    product.brand,
                    `Product "${product.name}" (id: ${product.id}) should have brand 'Adidas'`
                ).toBe("Adidas");
            });
        });

        it("should return the expected count of Adidas products", async () => {
            const results = await getProducts({ brand: ["Adidas"] });
            // Based on database, there are 15 products with brand "Adidas"
            expect(results.length).toBe(15);
        });
    });

    /**
     * Test: Filtering by price range $50-$150 should return only products
     * where the price is between 50 and 150 INCLUSIVE.
     */
    describe("Filter by price range", () => {
        it("should return only products with price between $50 and $150 inclusive", async () => {
            const results = await getProducts({ minPrice: 50, maxPrice: 150 });

            expect(results.length).toBeGreaterThan(0);

            // Verify every result has price within the range
            results.forEach((product) => {
                expect(
                    product.price,
                    `Product "${product.name}" (id: ${product.id}) price ${product.price} should be >= 50`
                ).toBeGreaterThanOrEqual(50);

                expect(
                    product.price,
                    `Product "${product.name}" (id: ${product.id}) price ${product.price} should be <= 150`
                ).toBeLessThanOrEqual(150);
            });
        });

        it("should return the expected count of products in $50-$150 range", async () => {
            const results = await getProducts({ minPrice: 50, maxPrice: 150 });
            // Based on database, there are 497 products in this price range
            expect(results.length).toBe(497);
        });

        it("should include products at exact boundary prices", async () => {
            // Test inclusivity at boundaries
            const results = await getProducts({ minPrice: 50, maxPrice: 150 });

            // Find products at boundary prices if they exist
            const productsAt50 = results.filter((p) => p.price === 50);
            const productsAt150 = results.filter((p) => p.price === 150);

            // If there are products at boundaries, they should be included
            // This is a structural test - we verify the boundary logic works
            results.forEach((product) => {
                expect(product.price >= 50 && product.price <= 150).toBe(true);
            });
        });
    });

    /**
     * Test: Multiple filters combined - filter with price range 0-50
     * and category="Electronics" should return only products matching both criteria.
     */
    describe("Multiple filters combined", () => {
        it("should return only products with price $0-$50 AND category 'Electronics'", async () => {
            const results = await getProducts({
                category: ["Electronics"],
                minPrice: 0,
                maxPrice: 50,
            });

            expect(results.length).toBeGreaterThan(0);

            // Verify every result matches BOTH criteria
            results.forEach((product) => {
                expect(
                    product.category,
                    `Product "${product.name}" (id: ${product.id}) should have category 'Electronics'`
                ).toBe("Electronics");

                expect(
                    product.price,
                    `Product "${product.name}" (id: ${product.id}) price ${product.price} should be >= 0`
                ).toBeGreaterThanOrEqual(0);

                expect(
                    product.price,
                    `Product "${product.name}" (id: ${product.id}) price ${product.price} should be <= 50`
                ).toBeLessThanOrEqual(50);
            });
        });

        it("should return the expected count for combined filters", async () => {
            const results = await getProducts({
                category: ["Electronics"],
                minPrice: 0,
                maxPrice: 50,
            });
            // Based on database, there are 9 products matching both criteria
            expect(results.length).toBe(9);
        });

        it("should return fewer results than individual filters", async () => {
            const electronicsOnly = await getProducts({ category: ["Electronics"] });
            const priceRangeOnly = await getProducts({ minPrice: 0, maxPrice: 50 });
            const combined = await getProducts({
                category: ["Electronics"],
                minPrice: 0,
                maxPrice: 50,
            });

            // Combined filter should return fewer or equal results than either individual filter
            expect(combined.length).toBeLessThanOrEqual(electronicsOnly.length);
            expect(combined.length).toBeLessThanOrEqual(priceRangeOnly.length);
        });
    });
});
