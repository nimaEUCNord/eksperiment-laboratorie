'use client';

import { useCallback, useState, useEffect } from 'react';

const SCHEMA_VERSION = 1;

export interface PersistedLabGuideState {
  hypothesis: string;
  varInputs: Record<string, { fysiskStorrelse: string; symbol: string; enhed: string }>;
  validationErrors: Record<string, Record<string, boolean>>;
  validatedFields: Record<string, Set<'fysiskStorrelse' | 'symbol' | 'enhed'>>;
  materialsChecked: boolean[];
  setupChecked: boolean[];
  rows: Record<string, string>[];
  studentValue: string;
  reflections: string[];
  mode: 'guidet' | 'semi' | 'open';
}

interface StoredData {
  version: number;
  state: PersistedLabGuideState;
  timestamp: number;
}

export function useLabGuidePersistence(labSlug: string) {
  const storageKey = `lab-guide:${labSlug}`;
  const [hasStoredData, setHasStoredData] = useState(false);
  const [restoredNotification, setRestoredNotification] = useState(false);

  // Check for stored data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored) as StoredData;
        if (data.version === SCHEMA_VERSION) {
          setHasStoredData(true);
        } else {
          // Schema mismatch, discard old data
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.warn(`Failed to check stored data for lab ${labSlug}:`, e);
    }
  }, [labSlug, storageKey]);

  const restoreState = useCallback((): Partial<PersistedLabGuideState> | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const data = JSON.parse(stored) as StoredData;
      if (data.version !== SCHEMA_VERSION) {
        return null;
      }

      // Convert Arrays back to Sets for validatedFields
      const state = { ...data.state };
      if (state.validatedFields && typeof state.validatedFields === 'object') {
        const convertedFields: Record<string, Set<'fysiskStorrelse' | 'symbol' | 'enhed'>> = {};
        Object.entries(state.validatedFields).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            convertedFields[key] = new Set(value);
          } else if (value instanceof Set) {
            convertedFields[key] = value;
          }
        });
        state.validatedFields = convertedFields;
      }

      setRestoredNotification(true);
      return state;
    } catch (e) {
      console.warn(`Failed to restore state for lab ${labSlug}:`, e);
      return null;
    }
  }, [labSlug, storageKey]);

  const saveState = useCallback((state: Partial<PersistedLabGuideState>) => {
    try {
      // Convert Set to Array for JSON serialization
      const stateToStore = { ...state };
      if (stateToStore.validatedFields instanceof Set) {
        stateToStore.validatedFields = Array.from(stateToStore.validatedFields) as any;
      }

      const data: StoredData = {
        version: SCHEMA_VERSION,
        state: stateToStore as PersistedLabGuideState,
        timestamp: Date.now(),
      };

      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      if (e instanceof DOMException && e.code === 22) {
        console.warn(`localStorage quota exceeded for lab ${labSlug}`);
      } else {
        console.warn(`Failed to save state for lab ${labSlug}:`, e);
      }
    }
  }, [labSlug, storageKey]);

  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasStoredData(false);
    } catch (e) {
      console.warn(`Failed to clear state for lab ${labSlug}:`, e);
    }
  }, [labSlug, storageKey]);

  return {
    restoreState,
    saveState,
    clearState,
    hasStoredData,
    restoredNotification,
    setRestoredNotification,
  };
}
