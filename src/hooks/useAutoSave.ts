import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoSaveOptions {
  delay?: number;
  onSave: (data: any) => Promise<void> | void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useAutoSave<T>(
  data: T,
  options: UseAutoSaveOptions
) {
  const {
    delay = 1000,
    onSave,
    onError,
    enabled = true
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<T>();
  const isSavingRef = useRef(false);

  const save = useCallback(async (dataToSave: T) => {
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      await onSave(dataToSave);
      lastSavedRef.current = dataToSave;
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError?.(error as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onError]);

  useEffect(() => {
    if (!enabled || !data) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
      return;
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current
  };
}

// Hook for form auto-save
export function useFormAutoSave<T extends Record<string, any>>(
  formData: T,
  saveKey: string,
  options?: Omit<UseAutoSaveOptions, 'onSave'>
) {
  const onSave = useCallback(async (data: T) => {
    localStorage.setItem(saveKey, JSON.stringify(data));
  }, [saveKey]);

  const onError = useCallback((error: Error) => {
    console.error(`Auto-save failed for ${saveKey}:`, error);
  }, [saveKey]);

  return useAutoSave(formData, {
    ...options,
    onSave,
    onError
  });
}

// Hook for draft recovery
export function useDraftRecovery<T>(
  key: string,
  initialData: T
): [T, (data: T) => void, () => void] {
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const saveDraft = useCallback((newData: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [key]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(initialData);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [key, initialData]);

  return [data, saveDraft, clearDraft];
}
