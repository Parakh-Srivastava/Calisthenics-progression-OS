import { useEffect } from 'react';

const backActions = [];

export function registerBackAction(action) {
  backActions.push(action);
  return () => {
    const index = backActions.lastIndexOf(action);
    if (index !== -1) backActions.splice(index, 1);
  };
}

export function useBackDismiss(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;
    return registerBackAction(onClose);
  }, [isOpen, onClose]);
}

export function dismissTopBackAction() {
  const action = backActions[backActions.length - 1];
  if (!action) return false;
  action();
  return true;
}
