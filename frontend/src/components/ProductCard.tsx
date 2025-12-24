
import type { Product } from "../types/product";
import "./ProductCard.css";

type ProductCardProps = {
    product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="product-card">
            <div className="product-image-wrapper">
                <img
                    src={product.imageUrl || "https://placehold.co/300x300?text=No+Image"}
                    alt={product.name}
                    className="product-image"
                />
            </div>

            <h3 className="product-name">{product.name}</h3>

            <p className="product-description">{product.description}</p>

            <div className="product-rating">
                {product.rating.toFixed(1)} ★
            </div>

            <div className="product-price">
                ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className="product-category">
                {product.category}
            </div>
        </div>
    );
}
