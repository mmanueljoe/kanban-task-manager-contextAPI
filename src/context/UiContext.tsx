/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import type { UiContextType, UiState, UiToast } from '@/types/types';
import { uiReducer } from '@utils/uiReducer';

export const uiContext = createContext<UiContextType | null>(null);

const initialState: UiState = {
  loadingKeys: [],
  toasts: [],
};

const MIN_LOADING_DURATION_MS = 300;

export function UiProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [state, dispatch] = useReducer(uiReducer, initialState);
  const loadingStartTimesRef = useRef<Map<string, number>>(new Map());
  const stopTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const startLoading = useCallback((key: string) => {
    // Clear any existing timeout for this key
    const existingTimeout = stopTimeoutsRef.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      stopTimeoutsRef.current.delete(key);
    }

    // Record start time
    loadingStartTimesRef.current.set(key, Date.now());
    dispatch({ type: 'START_LOADING', payload: { key } });
  }, []);

  const stopLoading = useCallback((key: string) => {
    const startTime = loadingStartTimesRef.current.get(key);
    const elapsed = startTime ? Date.now() - startTime : 0;
    const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);

    // Clear any existing timeout for this key
    const existingTimeout = stopTimeoutsRef.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const doStop = () => {
      loadingStartTimesRef.current.delete(key);
      stopTimeoutsRef.current.delete(key);
      dispatch({ type: 'STOP_LOADING', payload: { key } });
    };

    if (remaining > 0) {
      // Schedule stop after minimum duration
      const timeout = setTimeout(doStop, remaining);
      stopTimeoutsRef.current.set(key, timeout);
    } else {
      // Minimum duration already met, stop immediately
      doStop();
    }
  }, []);

  const showToast = useCallback(
    ({ type, message }: Omit<UiToast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({
        type: 'SHOW_TOAST',
        payload: { id, type, message },
      });
    },
    [dispatch]
  );

  const isLoading = useCallback(
    (key?: string) => {
      if (key) {
        return state.loadingKeys.includes(key);
      }
      return state.loadingKeys.length > 0;
    },
    [state.loadingKeys]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = stopTimeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      // Clear the map after iterating
      Array.from(timeouts.keys()).forEach((key) => {
        timeouts.delete(key);
      });
    };
  }, []);

  const value: UiContextType = {
    state,
    dispatch,
    showToast,
    startLoading,
    stopLoading,
    isLoading,
  };

  return <uiContext.Provider value={value}>{children}</uiContext.Provider>;
}
