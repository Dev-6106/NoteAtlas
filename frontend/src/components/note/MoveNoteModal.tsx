import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { moveNote } from '@/store/folderSlice';
import { fetchNotes } from '@/store/noteSlice';
import { X, FolderInput, Folder as FolderIcon, LayoutGrid } from 'lucide-react';
import { useState } from 'react';

export default function MoveNoteModal({ 
  isOpen, 
  onClose, 
  noteId, 
  currentFolderId 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  noteId: string, 
  currentFolderId: string | null 
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { folders } = useSelector((state: RootState) => state.folders);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleMove = async (targetFolderId: string | null) => {
    try {
      setIsSubmitting(true);
      await dispatch(moveNote({ noteId, folderId: targetFolderId })).unwrap();
      await dispatch(fetchNotes({ page: 1, search: "", folderId: currentFolderId }));
      onClose();
    } catch (error) {
      console.error("Failed to move note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          borderRadius: 16, width: '100%', maxWidth: 400,
          boxShadow: 'var(--shadow-xl)', animation: 'fadeUp 0.2s ease-out',
          display: 'flex', flexDirection: 'column',
          maxHeight: '80vh',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderInput size={18} style={{ color: 'var(--primary-brand)' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-sans)' }}>Move Notebook</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '16px 24px', overflowY: 'auto' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16, fontFamily: 'var(--font-sans)' }}>
            Select a destination for this notebook.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              disabled={isSubmitting}
              onClick={() => handleMove(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-card)', color: 'var(--text-1)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            >
              <LayoutGrid size={18} style={{ color: 'var(--text-3)' }} />
              <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Root (No Folder)</span>
            </button>
            
            {folders.map(folder => (
              <button
                key={folder._id}
                disabled={isSubmitting}
                onClick={() => handleMove(folder._id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)', color: 'var(--text-1)',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              >
                <FolderIcon size={18} style={{ color: '#3b82f6' }} fill="currentColor" fillOpacity={0.2} />
                <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{folder.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
