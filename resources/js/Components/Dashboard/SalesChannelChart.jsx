import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6']; // Blue for offline, Purple for online

export default function SalesChannelChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p>Tidak ada data penjualan</p>
            </div>
        );
    }

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                    <p className="font-bold text-gray-800 capitalize">{payload[0].name}</p>
                    <p className="text-gray-900 font-medium">{formatRupiah(payload[0].value)}</p>
                    <p className="text-xs text-gray-500 mt-1">{payload[0].payload.total_transactions} transaksi</p>
                </div>
            );
        }
        return null;
    };

    // Make sure data maps name and value correctly for Recharts Pie
    const chartData = data.map(item => ({
        name: item.type,
        value: parseFloat(item.revenue),
        total_transactions: item.total_transactions
    }));

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span className="capitalize text-sm font-medium text-gray-600">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
