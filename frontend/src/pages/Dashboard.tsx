import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

interface Doc {
  _id: string;
  title: string;
  updatedAt: string;
}

function Dashboard() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDocuments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/documents',
        { title: newTitle || 'Untitled Document' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle('');
      setDocuments([res.data, ...documents]);
    } catch (err) {
      console.error('Failed to create document', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      <h2>Your Documents</h2>
      <button onClick={handleLogout}>Logout</button>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New document title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>

      <ul>
        {documents.map((doc) => (
          <li key={doc._id}>
            <Link to={`/editor/${doc._id}`}>{doc.title}</Link> — last updated {new Date(doc.updatedAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;