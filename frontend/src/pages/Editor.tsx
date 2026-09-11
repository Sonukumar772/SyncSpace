import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';

const randomColor = () =>
  '#' + Math.floor(Math.random() * 16777215).toString(16);

function Editor() {
  const { id } = useParams();
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [ydoc] = useState(() => new Y.Doc());
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('editor');
  const [shareMessage, setShareMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const newProvider = new SocketIOProvider(
      'http://localhost:5000',
      `syncspace-doc-${id}`,
      ydoc,
      {}
    );
    setProvider(newProvider);

    return () => {
      newProvider.destroy();
    };
  }, [id]);

  useEffect(() => {
    if (!provider) return;

    const updatePresence = () => {
      const states = provider.awareness.getStates();
      setActiveUsers(states.size);
    };

    provider.awareness.on('change', updatePresence);
    updatePresence();

    return () => {
      provider.awareness.off('change', updatePresence);
    };
  }, [provider]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareMessage('');

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:5000/api/documents/${id}/share`,
        { email: shareEmail, role: shareRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShareMessage(`Shared with ${shareEmail} as ${shareRole}`);
      setShareEmail('');
    } catch (err: any) {
      setShareMessage(err.response?.data?.message || 'Failed to share');
    }
  };

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        ...(provider
          ? [
              Collaboration.configure({ document: ydoc }),
              CollaborationCaret.configure({
                provider,
                user: { name: user.name || 'Anonymous', color: randomColor() },
              }),
            ]
          : []),
      ],
    },
    [provider]
  );

  if (!editor) return <p>Loading editor...</p>;

  return (
    <div>
      <h2>Document Editor</h2>
      <p>
        {activeUsers} {activeUsers === 1 ? 'person' : 'people'} editing
      </p>

      <form onSubmit={handleShare}>
        <input
          type="email"
          placeholder="Collaborator's email"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          required
        />
        <select value={shareRole} onChange={(e) => setShareRole(e.target.value)}>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button type="submit">Share</button>
      </form>

      {shareMessage && <p>{shareMessage}</p>}

      <EditorContent
        editor={editor}
        style={{ border: '1px solid #ccc', minHeight: '300px', padding: '1rem' }}
      />
    </div>
  );
}

export default Editor;