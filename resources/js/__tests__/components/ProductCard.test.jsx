import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/Components/Pos/ProductCard';

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────

const inStockProduct = {
    product_id: 1,
    name: 'Apel Fuji Premium',
    sku: 'APEL-FJP-001',
    category: 'Buah Import',
    selling_price: 45000,
    stock: 150,
    in_stock: true,
    image_path: null,
    tiers: [],
};

const outOfStockProduct = {
    ...inStockProduct,
    product_id: 2,
    name: 'Mangga Harum Manis',
    stock: 0,
    in_stock: false,
};

const productWithTiers = {
    ...inStockProduct,
    product_id: 3,
    name: 'Jeruk Pontianak',
    tiers: [
        { min_qty: 10, tier_price: 40000 },
        { min_qty: 50, tier_price: 35000 },
    ],
};

const productWithImage = {
    ...inStockProduct,
    product_id: 4,
    name: 'Semangka Merah',
    image_path: '/storage/products/semangka.jpg',
};

describe('ProductCard Component', () => {
    // ─────────────────────────────────────────────
    // Basic Rendering
    // ─────────────────────────────────────────────

    it('renders product name', () => {
        render(<ProductCard product={inStockProduct} onClick={() => {}} />);
        expect(screen.getByText('Apel Fuji Premium')).toBeInTheDocument();
    });

    it('renders product category', () => {
        render(<ProductCard product={inStockProduct} onClick={() => {}} />);
        expect(screen.getByText('Buah Import')).toBeInTheDocument();
    });

    it('renders formatted selling price', () => {
        render(<ProductCard product={inStockProduct} onClick={() => {}} />);
        // Rp45.000 (Intl.NumberFormat)
        expect(screen.getByText(/45\.000/)).toBeInTheDocument();
    });

    it('renders stock count', () => {
        render(<ProductCard product={inStockProduct} onClick={() => {}} />);
        expect(screen.getByText('Stok: 150')).toBeInTheDocument();
    });

    // ─────────────────────────────────────────────
    // Click Behavior
    // ─────────────────────────────────────────────

    it('calls onClick when in-stock product is clicked', () => {
        const mockClick = vi.fn();
        const { container } = render(<ProductCard product={inStockProduct} onClick={mockClick} />);

        fireEvent.click(container.firstChild);
        expect(mockClick).toHaveBeenCalledTimes(1);
        expect(mockClick).toHaveBeenCalledWith(inStockProduct);
    });

    it('does NOT call onClick when out-of-stock product is clicked', () => {
        const mockClick = vi.fn();
        const { container } = render(<ProductCard product={outOfStockProduct} onClick={mockClick} />);

        fireEvent.click(container.firstChild);
        expect(mockClick).not.toHaveBeenCalled();
    });

    // ─────────────────────────────────────────────
    // Out of Stock Styling
    // ─────────────────────────────────────────────

    it('shows opacity-60 for out-of-stock products', () => {
        const { container } = render(<ProductCard product={outOfStockProduct} onClick={() => {}} />);
        expect(container.firstChild.className).toContain('opacity-60');
    });

    it('shows cursor-not-allowed for out-of-stock products', () => {
        const { container } = render(<ProductCard product={outOfStockProduct} onClick={() => {}} />);
        expect(container.firstChild.className).toContain('cursor-not-allowed');
    });

    it('shows cursor-pointer for in-stock products', () => {
        const { container } = render(<ProductCard product={inStockProduct} onClick={() => {}} />);
        expect(container.firstChild.className).toContain('cursor-pointer');
    });

    // ─────────────────────────────────────────────
    // Tier Pricing Indicator
    // ─────────────────────────────────────────────

    it('shows "Tersedia harga grosir" when tiers exist', () => {
        render(<ProductCard product={productWithTiers} onClick={() => {}} />);
        expect(screen.getByText('Tersedia harga grosir')).toBeInTheDocument();
    });

    it('hides tier indicator when no tiers', () => {
        render(<ProductCard product={inStockProduct} onClick={() => {}} />);
        expect(screen.queryByText('Tersedia harga grosir')).not.toBeInTheDocument();
    });

    // ─────────────────────────────────────────────
    // Image Handling
    // ─────────────────────────────────────────────

    it('renders product image when image_path is provided', () => {
        render(<ProductCard product={productWithImage} onClick={() => {}} />);
        const img = screen.getByAltText('Semangka Merah');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('/storage/products/semangka.jpg');
    });

    it('renders placeholder icon when no image_path', () => {
        const { container } = render(<ProductCard product={inStockProduct} onClick={() => {}} />);
        // Should have SVG placeholder icon
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });
});
