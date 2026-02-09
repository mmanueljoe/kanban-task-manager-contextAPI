import { useState } from 'react';
import { useLocation, useOutlet, useParams } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Aside } from '@components/layout/Aside';
import { AddTaskModal } from '@components/modals/AddTaskModal';
import { EditBoardModal } from '@components/modals/EditBoardModal';
import { DeleteBoardModal } from '@components/modals/DeleteBoardModal';
import { useBoards } from '@/hooks/useBoards';
import iconShowSidebar from '@assets/icon-show-sidebar.svg';

export function Layout() {
  const { boards } = useBoards();
  const { boardId } = useParams<{ boardId?: string }>();
  const location = useLocation();
  const outlet = useOutlet();
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const boardIndex =
    boardId != null && /^\d+$/.test(boardId) ? parseInt(boardId, 10) : null;
  const currentBoard =
    boardIndex != null &&
    Number.isFinite(boardIndex) &&
    boardIndex >= 0 &&
    boardIndex < boards.length
      ? boards[boardIndex]
      : null;

  const columnOptions =
    currentBoard?.columns.map((c) => ({ value: c.name, label: c.name })) ?? [];

  return (
    <div
      className={`app-layout ${sidebarOpen ? '' : 'app-sidebar-hidden'}`}
      data-sidebar-open={sidebarOpen}
    >
      <Aside onHideSidebar={() => setSidebarOpen(false)} />
      <button
        type="button"
        className="app-show-sidebar-tab"
        onClick={() => setSidebarOpen(true)}
        aria-label="Show sidebar"
      >
        <img src={iconShowSidebar} alt="" width={16} height={11} />
      </button>
      <div className="app-layout-right">
        <Header
          onAddTask={() => setAddTaskOpen(true)}
          onEditBoard={() => setEditBoardOpen(true)}
          onDeleteBoard={() => setDeleteBoardOpen(true)}
          canEditBoard={currentBoard != null}
        />
        <main className="app-layout-main">
          <AnimatePresence mode="wait" initial={false}>
            {outlet && (
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {outlet}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <AddTaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        columnOptions={
          columnOptions.length > 0
            ? columnOptions
            : [{ value: 'Todo', label: 'Todo' }]
        }
        boardIndex={boardIndex}
      />
      {currentBoard && (
        <>
          <EditBoardModal
            open={editBoardOpen}
            onClose={() => setEditBoardOpen(false)}
            boardName={currentBoard.name}
            columnNames={currentBoard.columns.map((c) => c.name)}
            boardIndex={boardIndex}
            originalBoard={currentBoard}
          />
          <DeleteBoardModal
            open={deleteBoardOpen}
            onClose={() => setDeleteBoardOpen(false)}
            onConfirm={() => {}}
            boardName={currentBoard.name}
            boardIndex={boardIndex}
          />
        </>
      )}
    </div>
  );
}
