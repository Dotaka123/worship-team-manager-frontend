import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membersAPI, notesAPI, attendanceAPI } from '../services/api';
import MemberForm from '../components/MemberForm';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [notes, setNotes] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberRes, notesRes, attendanceRes] = await Promise.all([
          membersAPI.getOne(id),
          notesAPI.getByMember(id),
          attendanceAPI.getMemberHistory(id)
        ]);
        setMember(memberRes.data);
        setNotes(notesRes.data);
        setAttendance(attendanceRes.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      const { data } = await membersAPI.update(id, formData);
      setMember(data);
      setEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const { data } = await membersAPI.toggleStatus(id);
      setMember(data);
    } catch (error) {
      alert('Erreur');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const { data } = await notesAPI.create({ memberId: id, content: newNote });
      setNotes([data, ...notes]);
      setNewNote('');
    } catch (error) {
      alert('Erreur');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      setNotes(notes.filter(n => n._id !== noteId));
    } catch (error) {
      alert('Erreur');
    }
  };

  if (!member) {
    return <p className="text-gray-400">Chargement...</p>;
  }

  return (
    <div>
      {/* Header */}
      <button onClick={() => navigate('/members')} className="text-gray-400 hover:text-white mb-4">
        ← Retour aux membres
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Infos membre */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            {editing ? (
              <MemberForm member={member} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{member.name}</h1>
                    <p className="text-gray-400 capitalize">{member.role} {member.instrument && `• ${member.instrument}`}</p>
                    {member.group && <p className="text-sm text-gray-500">{member.group}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${member.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                    {member.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                
                {(member.phone || member.email) && (
                  <div className="text-sm text-gray-400 mb-4">
                    {member.phone && <p>📞 {member.phone}</p>}
                    {member.email && <p>✉️ {member.email}</p>}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setEditing(true)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition">
                    Modifier
                  </button>
                  <button onClick={handleToggleStatus} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                    {member.isActive ? 'Désactiver' : 'Réactiver'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <button onClick={handleAddNote} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition">
                Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune note</p>
              ) : (
                notes.map((note) => (
                  <div key={note._id} className="p-3 bg-gray-700/50 rounded-lg flex justify-between items-start">
                    <div>
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteNote(note._id)} className="text-gray-500 hover:text-red-400">
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Historique présences */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Historique présences</h2>
          <div className="space-y-2">
            {attendance.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun historique</p>
            ) : (
              attendance.map((record) => (
                <div key={record._id} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-sm">{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                  <span className={`text-sm ${record.status === 'present' ? 'text-green-400' : 'text-red-400'}`}>
                    {record.status === 'present' ? 'Présent' : 'Absent'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
