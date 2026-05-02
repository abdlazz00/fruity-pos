import React from 'react';
import Modal from '../Modal';
import Button from '../Button';

export default function TransactionResultModal({ isOpen, status, transaction, onClose }) {
    const isSuccess = status === 'success';

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isSuccess ? "Transaksi Berhasil" : "Transaksi Gagal"} maxWidth="sm">
            <div className="flex flex-col items-center justify-center p-4 text-center">
                {isSuccess ? (
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}

                <h3 className={`text-xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {isSuccess ? "Berhasil Memproses Transaksi!" : "Gagal Memproses Transaksi"}
                </h3>

                {isSuccess && transaction && (
                    <div className="w-full bg-gray-50 p-4 rounded-xl text-left border border-gray-200 mt-2 mb-4">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                            <span className="text-gray-500 text-sm">No. Transaksi</span>
                            <span className="font-mono font-bold text-gray-900">{transaction.transaction_number}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">Total Belanja</span>
                            <span className="font-bold text-gray-900">{formatRupiah(transaction.total)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">Metode</span>
                            <span className="font-medium text-gray-900 uppercase">{transaction.payment_method}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Kembalian</span>
                            <span className="font-bold text-green-600">{formatRupiah(transaction.change_amount)}</span>
                        </div>
                    </div>
                )}

                {!isSuccess && (
                    <p className="text-gray-600 mb-6 mt-2">
                        Maaf, terjadi kesalahan saat memproses transaksi. Silakan periksa kembali keranjang atau koneksi Anda.
                    </p>
                )}

                <Button 
                    variant={isSuccess ? "primary" : "ghost"} 
                    className="w-full justify-center py-3" 
                    onClick={onClose}
                >
                    {isSuccess ? "Selesai" : "Tutup"}
                </Button>
            </div>
        </Modal>
    );
}
