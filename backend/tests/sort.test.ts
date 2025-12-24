import { describe, it, expect } from "vitest";
import { getProducts } from "../src/repositories/products.repo";

/**
 * Test suite for the product sort functionality.
 *
 * The sort API accepts a `sort` query parameter with the following options:
 * - "price_asc": Sort by price ascending (low to high)
 * - "price_desc": Sort by price descending (high to low)
 * - "rating": Sort by rating descending (highest rated first)
 * - "popular": Sort by purchase count descending (most popular first)
 *
 * API Request: GET /products?sort=<sort_option>&brand=<brand>
 * API Response: { items: Product[] }
 *
 * All tests in this file use brand='Adidas' filter and empty search query.
 */
describe("Product Sort Functionality", () => {
    const FILTER_BRAND = ["Adidas"];

    /**
     * Test: Sort by price ascending (low to high)
     */
    describe("Sort by price_asc (Price: Low to High)", () => {
        it("should return products sorted by price in ascending order", async () => {
            const results = await getProducts({
                brand: FILTER_BRAND,
                sort: "price_asc",
            });

            expect(results.length).toBeGreaterThan(0);

            // Verify products are sorted by price ascending
            for (let i = 1; i < results.length; i++) {
                expect(
                    results[i].price,
                    `Product at index ${i} (${results[i].name}, $${results[i].price}) should have price >= previous product (${results[i - 1].name}, $${results[i - 1].price})`
                ).toBeGreaterThanOrEqual(results[i - 1].price);
            }
        });

        it("should have the lowest priced product first", async () => {
            const results = await getProducts({
                brand: FILTER_BRAND,
                sort: "price_asc",
            });

            const minPrice = Math.min(...results.map((p) => p.price));
            expect(results[0].price).toBe(minPrice);
        });
    });

    /**
     * Test: Sort by price descending (high to low)
     */
    describe("Sort by price_desc (Price: High to Low)", () => {
        it("should return products sorted by price in descending order", async () => {
            const results = await getProducts({
                brand: FILTER_BRAND,
                sort: "price_desc",
            });

            expect(results.length).toBeGreaterThan(0);

            // Verify products are sorted by price descending
            for (let i = 1; i < results.length; i++) {
                expect(
                    results[i].price,
                    `Product at index ${i} (${results[i].name}, $${results[i].price}) should have price <= previous product (${results[i - 1].name}, $${results[i - 1].price})`
                ).toBeLessThanOrEqual(results[i - 1].price);
            }
        });

        it("should have the highest priced product first", async () => {
            const results = await getProducts({
                brand: FILTER_BRAND,
                sort: "price_desc",
            });

            const maxPrice = Math.max(...results.map((p) => p.price));
            expect(results[0].price).toBe(maxPrice);
        });
    });

    /**
     * Test: Sort by rating (highest rated first)
     */
    describe("Sort by rating (Customer Rating)", () => {
        it("should return products sorted by rating in descending order", async () => {
            const results = await getProducts({
                brand: FILTER_BRAND,
                sort: "rating",
            });

            expect(results.length).toBeGreaterThan(0);

            // Verify products are sorted by rating descending
            for (let i = 1; i < results.length; i++) {
                expect(
                    results[i].rating,
                    `Product at index ${i} (${results[i].name}, rating: ${results[i].rating}) should have rating <= previous product (${results[i - 1].name}, rating: ${results[i - 1].rating})`
                ).toBeLessThanOrEqual(results[i - 1].rating);
            }
        });

        it("should have the highest rated product first", async () => {
            const results = await getProducts({
                brand: FILTER_BRAND,
                sort: "rating",
            });

            const maxRating = Math.max(...results.map((p) => p.rating));
            expect(results[0].rating).toBe(maxRating);
        });
    });

    /**
     * Test: Sort by popularity (most purchased first)
     */
    describe("Sort by popular (Most Popular)", () => {
        it("should return products sorted by purchase count in descending order", async () => {
            const results = await getProducts({
                brand: FILTER_BRAND,
                sort: "popular",
            });

            expect(results.length).toBeGreaterThan(0);

            // Verify products are sorted by purchaseCount descending
            for (let i = 1; i < results.length; i++) {
                expect(
                    results[i].purchaseCount,
                    `Product at index ${i} (${results[i].name}, purchases: ${results[i].purchaseCount}) should have purchaseCount <= previous product (${results[i - 1].name}, purchases: ${results[i - 1].purchaseCount})`
                ).toBeLessThanOrEqual(results[i - 1].purchaseCount);
            }
        });

        it("should have the most purchased product first", async () => {
            const results = await getProducts({
                brand: FILTER_BRAND,
                sort: "popular",
            });

            const maxPurchaseCount = Math.max(...results.map((p) => p.purchaseCount));
            expect(results[0].purchaseCount).toBe(maxPurchaseCount);
        });
    });

    /**
     * Test: All sort options return the same products (only order differs)
     */
    describe("Sort consistency", () => {
        it("should return the same products regardless of sort option", async () => {
            const priceAscResults = await getProducts({
                brand: FILTER_BRAND,
                sort: "price_asc",
            });
            const priceDescResults = await getProducts({
                brand: FILTER_BRAND,
                sort: "price_desc",
            });
            const ratingResults = await getProducts({
                brand: FILTER_BRAND,
                sort: "rating",
            });
            const popularResults = await getProducts({
                brand: FILTER_BRAND,
                sort: "popular",
            });

            // All should have the same count
            expect(priceAscResults.length).toBe(priceDescResults.length);
            expect(priceDescResults.length).toBe(ratingResults.length);
            expect(ratingResults.length).toBe(popularResults.length);

            // All should contain the same product IDs
            const priceAscIds = priceAscResults.map((p) => p.id).sort();
            const priceDescIds = priceDescResults.map((p) => p.id).sort();
            const ratingIds = ratingResults.map((p) => p.id).sort();
            const popularIds = popularResults.map((p) => p.id).sort();

            expect(priceAscIds).toEqual(priceDescIds);
            expect(priceDescIds).toEqual(ratingIds);
            expect(ratingIds).toEqual(popularIds);
        });
    });
});
