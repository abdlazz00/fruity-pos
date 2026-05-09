import React from 'react';

export default function OfflineIndicator({ isOnline, pendingCount, isSyncing, onSyncClick }) {
  return (
    <div className="flex items-center gap-2">
      {/* Connection Status Dot */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
        isOnline 
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
          : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {isOnline ? 'Online' : 'Offline'}
      </div>

      {/* Pending Sync Badge */}
      {pendingCount > 0 && (
        <button
          onClick={onSyncClick}
          disabled={isSyncing || !isOnline}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isSyncing
              ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-wait'
              : isOnline
                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer'
                : 'bg-gray-50 text-gray-500 border border-gray-200 cursor-not-allowed'
          }`}
        >
          {isSyncing ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Syncing...
            </>
          ) : (
            <>📤 {pendingCount} Pending</>
          )}
        </button>
      )}
    </div>
  );
}
