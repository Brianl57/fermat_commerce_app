import { describe, it, expect, beforeAll } from "vitest";
import { getProducts } from "../src/repositories/products.repo";

/**
 * Test suite for the product search functionality.
 * 
 * The search API accepts a `q` query parameter and searches for matches
 * in both the product `name` and `description` fields using case-insensitive
 * matching (SQL LIKE with wildcards).
 * 
 * API Request: GET /products?q=<search_term>
 * API Response: { items: Product[] }
 */
describe("Product Search Functionality", () => {
    /**
     * Test: Searching 'bose' should only return products where the string 'bose'
     * is in either the product name or description.
     */
    describe("Search by term 'bose'", () => {
        it("should return only products containing 'bose' in name or description", async () => {
            const results = await getProducts({ q: "bose" });

            expect(results.length).toBeGreaterThan(0);

            // Verify every result contains 'bose' in either name or description
            results.forEach((product) => {
                const nameContainsBose = product.name.toLowerCase().includes("bose");
                const descriptionContainsBose = product.description.toLowerCase().includes("bose");

                expect(
                    nameContainsBose || descriptionContainsBose,
                    `Product "${product.name}" (id: ${product.id}) should contain 'bose' in name or description`
                ).toBe(true);
            });
        });

        it("should return the expected count of Bose products", async () => {
            const results = await getProducts({ q: "bose" });
            // Based on database, there are 8 products containing 'bose'
            expect(results.length).toBe(8);
        });
    });

    /**
     * Test: Search should be case-insensitive.
     * 'bose' and 'BOSE' should return the same products.
     */
    describe("Case-insensitive search", () => {
        it("should return the same products for 'bose' and 'BOSE'", async () => {
            const lowercaseResults = await getProducts({ q: "bose" });
            const uppercaseResults = await getProducts({ q: "BOSE" });

            // Should have the same number of results
            expect(lowercaseResults.length).toBe(uppercaseResults.length);

            // Extract IDs and sort for comparison
            const lowercaseIds = lowercaseResults.map((p) => p.id).sort();
            const uppercaseIds = uppercaseResults.map((p) => p.id).sort();

            expect(lowercaseIds).toEqual(uppercaseIds);
        });

        it("should return the same products for mixed case 'BoSe'", async () => {
            const lowercaseResults = await getProducts({ q: "bose" });
            const mixedCaseResults = await getProducts({ q: "BoSe" });

            const lowercaseIds = lowercaseResults.map((p) => p.id).sort();
            const mixedCaseIds = mixedCaseResults.map((p) => p.id).sort();

            expect(lowercaseIds).toEqual(mixedCaseIds);
        });
    });

    /**
     * Test: Search with phrase "High-quality wireless" should return only products
     * whose description contains "High-quality wireless".
     */
    describe("Search by phrase 'High-quality wireless'", () => {
        it("should return only products with 'High-quality wireless' in description", async () => {
            const results = await getProducts({ q: "High-quality wireless" });

            expect(results.length).toBeGreaterThan(0);

            // Verify every result contains 'high-quality wireless' in description
            results.forEach((product) => {
                const descriptionContainsPhrase = product.description
                    .toLowerCase()
                    .includes("high-quality wireless");

                expect(
                    descriptionContainsPhrase,
                    `Product "${product.name}" (id: ${product.id}) should contain 'High-quality wireless' in description`
                ).toBe(true);
            });
        });

        it("should return the expected count of products with 'High-quality wireless'", async () => {
            const results = await getProducts({ q: "High-quality wireless" });
            // Based on database, there are 45 products with this phrase in description
            expect(results.length).toBe(45);
        });
    });

    /**
     * Test: Search with an invalid query that doesn't match any products
     * should return an empty list.
     */
    describe("Search with invalid/non-matching query", () => {
        it("should return an empty list for 'INVALID' search term", async () => {
            const results = await getProducts({ q: "INVALID" });

            expect(results).toEqual([]);
            expect(results.length).toBe(0);
        });

        it("should return an empty list for a random non-existent term", async () => {
            const results = await getProducts({ q: "xyznonexistent123" });

            expect(results).toEqual([]);
            expect(results.length).toBe(0);
        });
    });
});
