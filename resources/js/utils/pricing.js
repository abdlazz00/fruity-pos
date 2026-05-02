export function calculateMarginActual(sellingPrice, avgCost) {
    if (!avgCost || avgCost <= 0) return 0;
    return (((sellingPrice - avgCost) / avgCost) * 100).toFixed(2);
}

export function getMarginColor(marginPercent) {
    if (marginPercent >= 20) return 'text-emerald-600';
    if (marginPercent >= 10) return 'text-amber-500';
    return 'text-red-500';
}
