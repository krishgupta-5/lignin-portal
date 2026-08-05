import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getUserTempUnit,
  getTempSymbol,
  getTempUnitLabel,
  convertTempFromCelsius,
  convertTempToCelsius,
  formatTemperature,
  getTempRange,
} from '../utils/tempConverter';

const DEFAULT_PREFERENCES = {
  defaultModel: 'node_augmented',
  tempUnit: 'celsius',
  autoSave: true,
  highPerformanceThreshold: 70,
};

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [preferences, setPreferencesState] = useState(() => {
    try {
      const saved = localStorage.getItem('user_research_prefs');
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const updatePreferences = useCallback((newPrefs) => {
    setPreferencesState((prev) => {
      const updated = typeof newPrefs === 'function' ? newPrefs(prev) : { ...prev, ...newPrefs };
      try {
        localStorage.setItem('user_research_prefs', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('user_research_prefs_updated', { detail: updated }));
      } catch (err) {
        console.error('Failed to save user research preferences:', err);
      }
      return updated;
    });
  }, []);

  // Listen for preference changes from other components/windows
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'user_research_prefs' && e.newValue) {
        try {
          setPreferencesState({ ...DEFAULT_PREFERENCES, ...JSON.parse(e.newValue) });
        } catch {}
      }
    };
    const handleCustom = (e) => {
      if (e.detail) {
        setPreferencesState({ ...DEFAULT_PREFERENCES, ...e.detail });
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('user_research_prefs_updated', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('user_research_prefs_updated', handleCustom);
    };
  }, []);

  const tempUnit = preferences.tempUnit || 'celsius';
  const tempSymbol = getTempSymbol(tempUnit);
  const tempUnitLabel = getTempUnitLabel(tempUnit);

  const convertTempFromC = useCallback(
    (cVal) => convertTempFromCelsius(cVal, tempUnit),
    [tempUnit]
  );

  const convertTempToC = useCallback(
    (val) => convertTempToCelsius(val, tempUnit),
    [tempUnit]
  );

  const formatTemp = useCallback(
    (cVal, showUnit = true) => formatTemperature(cVal, tempUnit, showUnit),
    [tempUnit]
  );

  const getRange = useCallback(
    (minC = 60, maxC = 200) => getTempRange(minC, maxC, tempUnit),
    [tempUnit]
  );

  const value = {
    preferences,
    updatePreferences,
    tempUnit,
    tempSymbol,
    tempUnitLabel,
    convertTempFromC,
    convertTempToC,
    formatTemp,
    getTempRange: getRange,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    const unit = getUserTempUnit();
    return {
      preferences: DEFAULT_PREFERENCES,
      updatePreferences: () => {},
      tempUnit: unit,
      tempSymbol: getTempSymbol(unit),
      tempUnitLabel: getTempUnitLabel(unit),
      convertTempFromC: (v) => convertTempFromCelsius(v, unit),
      convertTempToC: (v) => convertTempToCelsius(v, unit),
      formatTemp: (v, s = true) => formatTemperature(v, unit, s),
      getTempRange: (min, max) => getTempRange(min, max, unit),
    };
  }
  return ctx;
}
