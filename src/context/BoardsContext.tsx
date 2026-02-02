import { useReducer, useEffect } from 'react';
import type { BoardsContextType } from '@/types/types';
import data from '@data/data.json';
import type { BoardsData, BoardsState } from '@/types/types';
import { getBoards, setBoards } from '@/utils/localStorage';
import { boardsReducer } from '@/utils/boardsReducer';
import { boardsContext } from '@/utils/boardsContext';
import { useUi } from '@/hooks/useUi';

export function BoardsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { startLoading, stopLoading } = useUi();
  const [state, dispatch] = useReducer(boardsReducer, {
    boards: [],
  } as BoardsState);

  // Load initial data from localStorage on mount
  useEffect(() => {
    startLoading('initBoards');
    // Small delay ensures loading overlay renders and provides visual feedback
    setTimeout(() => {
      try {
        const loadedBoards = getBoards()?.boards ?? (data as BoardsData).boards;
        dispatch({
          type: 'SET_BOARDS',
          payload: { boards: loadedBoards },
        });
      } catch (error) {
        console.error('Error loading boards:', error);
        // Fallback to default data if localStorage read fails
        dispatch({
          type: 'SET_BOARDS',
          payload: { boards: (data as BoardsData).boards },
        });
      } finally {
        stopLoading('initBoards');
      }
    }, 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist boards to localStorage whenever they change
  useEffect(() => {
    if (state.boards.length > 0) {
      setBoards({ boards: state.boards });
    }
  }, [state.boards]);

  const value: BoardsContextType = {
    boards: state.boards,
    dispatch,
  };
  return (
    <boardsContext.Provider value={value}>{children}</boardsContext.Provider>
  );
}
