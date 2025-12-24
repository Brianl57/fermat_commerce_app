# E-Commerce Application

I also documented my entire process on Notion: [Fermat Commerce App](https://handsome-custard-d5e.notion.site/Fermat-Commerce-App-2d2b325322fc80e2a67ceb0735005997)

## Prerequisites
- Node.js (v18+ recommended)
- npm

## Setup & Running
Clone this repository.

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with initial data:
   ```bash
   npm run seed
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:4000`.

### Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

## Testing
To run tests, navigate to the backend directory and run:
```bash
npm run test
```

## Overview of Approach + Architecture

### Project Structure
This project is structured as a **monorepo**, containing both the backend and frontend applications in a single repository.

- `backend/`: Node.js/Express server with SQLite.
- `frontend/`: React application built with Vite.

### Backend Design Decisions

#### Database Strategy: SQLite & Relational Modeling
I chose **SQLite** as the database because a relational model is highly effective for the core requirements of e-commerce: complex filtering, searching, and sorting. Using SQL allows us to leverage powerful `WHERE` clauses for filtered data retrieval.

**Data Modeling**:
The data is modeled using a normalized schema consisting of:
- `products`: Core product details.
- `product_tags`: Many-to-many relationship for flexible categorization.
- `orders` & `order_items`: Transactional data to track sales and popularity.


**Performance Optimizations**:
Indices are created on frequently queried columns (like `category`, `brand`, and `price`) for faster retrieval of filtered data because it avoids the need to scan the entire table.

#### Unified Query Architecture
A key design highlight is the **Unified Repository Pattern** for product retrieval. Instead of creating separate endpoints for search, filter, and sort, I implemented a single, robust repository function.

- **How it works**: This function accepts a flexible input object (containing query terms, active filters, price ranges, and sort keys) and dynamically constructs the SQL query by appending constraints to the `WHERE` clause.
- **Benefits**: This approach makes the backend extremely elegant and scalable. Adding a new filter requires only a small extension to the query builder logic, rather than new API endpoints.

#### Layered Architecture
The backend follows a strict separation of concerns using a **Controller-Service-Repository** pattern:
1.  **Routes**: Defines API endpoints and handles HTTP request/response parsing.
2.  **Services**: Contains the business logic/"rules" of the application.
3.  **Repositories**: Layer that should only interact with the database. This isolates raw SQL queries, making the code easier to test and maintain.

### Frontend Architecture
**Technology Stack**: TypeScript, React, Vite.

#### Key Components:
- **`src/main.tsx`**: Entry point.
- **`src/App.tsx`**: Main component structure.
- **`src/pages/`**: Page-level components (e.g., Product Catalog).
- **`src/api/`**: Centralized API layer that handles all HTTP communication, ensuring the UI remains decoupled from fetching logic.


## Calculating Popularity
Because I separated the items from the orders table into a separate table of its own (`order_items`), popularity is calculated dynamically by joining the `products` table with `order_items`.

**Implementation details**:
In the unified `getProducts` repository function, I perform a `LEFT JOIN` on `order_items` and aggregate quantity sold by `productId`.
```sql
LEFT JOIN order_items oi ON p.id = oi.productId
...
COALESCE(SUM(oi.quantity), 0) as purchaseCount
```
This sums up the `quantity` column for each product to represent total units sold. This operation is performed on every request to the `getProducts` endpoint, ensuring that the "Most Popular" sort option is always up-to-date and works in conjunction with other filters.

## Assumptions

- **Data**: `orderId`, `customerId`, and `productId` are unique. `rating` is strictly 0.0-5.0. All order and product objects have no null field values.
- **Search**: Exact matching only; Assume users will not make typos.
- **Filtering**: Price ranges are inclusive ($0 to infinity). If `minPrice > maxPrice`, an empty list is returned.
- **Sorting**: A default order serves as the fallback when no sort option is selected.

## Tradeoffs
1. monorepo: 
    - pro: ease of development and maintainence
    - con: must update both frontend and backend when shared types are modified -> introduces risk of inconsistent types

2. SQLite + relational modeling
    - pro: fast to build, easy local dev, SQL is strong for search/filter/sort and joins.
    - con: concurrency limits (single writes only)

3. Schema design
    - pro: separating tags and order items into separate tables adds support for filtering by tags and sort by popularity.
    - con: more complex queries and joins + additional tables

4.  Unified “getProducts” query builder (single repository function)
    - pro: elegant and scalable, centralizes logic for product retrieval.
    - con: complex since its one giant query; hard to debug; caclulates popularity on every request adds overhead

5. routes -> services -> repositories layering:
    - pro: each layer has a single responsibility; makes backend code easier to test and maintain
    - con: overkill for a small app

## What I would do with more time
- implement a more robust search functionality that allows for typos and partial matches
- add support for pagination 
- add filtering by tags 
- calculate popularity when new orders are added instead of on every request
- add better UI/UX for loading states
- test error handling for edge cases

## Bugs + Limitations
- No security measure to prevent SQL injection (e.g. user may accidently delete entire table)
- Some item image links return 404 error
- images all different sizes not fitted nicely
- search is exact matching only; assume users will not make typos
