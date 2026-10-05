import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useBackDismiss } from '../../hooks/useBackDismiss';

/** Bottom sheet modal component */
export default function BottomSheet({ isOpen, onClose, title, children, className = '' }) {
  useBackDismiss(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-3xl max-h-[85vh] overflow-y-auto safe-area-bottom ${className}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-800 transition-colors touch-target"
                  aria-label="Close"
                >
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>
            )}
            {/* Content */}
            <div className="px-5 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Confirmation modal */
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) {
  useBackDismiss(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-zinc-400 text-sm mb-6">{message}</p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-medium touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium touch-target ${
                    danger 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-violet-600 text-white'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
