import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { createNewFolder } from '@/store/folderSlice';
import { X, FolderPlus } from 'lucide-react';
import { T } from "@/components/ThemeTokens";

export default function CreateFolderModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [folderName, setFolderName] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      dispatch(createNewFolder(folderName.trim()));
      setFolderName('');
      onClose();
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
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderPlus size={18} style={{ color: 'var(--primary-brand)' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-sans)' }}>Create Folder</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
            Folder Name
          </label>
          <input
            autoFocus
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g. Science Projects"
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
              borderRadius: 10, color: 'var(--text-1)', fontSize: 14, fontFamily: 'var(--font-sans)',
              outline: 'none', transition: 'border-color 0.2s', marginBottom: 24,
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-brand)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border-default)',
                background: 'transparent', color: 'var(--text-2)', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: folderName.trim() ? 'var(--primary-brand)' : 'var(--bg-card-hover)',
                color: folderName.trim() ? '#fff' : 'var(--text-3)',
                fontSize: 14, fontWeight: 500, cursor: folderName.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-sans)', transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => { if (folderName.trim()) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { if (folderName.trim()) e.currentTarget.style.opacity = '1'; }}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
