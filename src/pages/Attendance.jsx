import { useState, useEffect } from 'react';
import { membersAPI, attendanceAPI } from '../services/api';
import AttendanceTable from '../components/AttendanceTable';

const Attendance = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  // Charger le type depuis localStorage ou utiliser 'repetition' par défaut
  const [eventType, setEventType] = useState(() => {
    return localStorage.getItem('lastEventType') || 'repetition';
  });
  const [customEventType, setCustomEventType] = useState(() => {
    return localStorage.getItem('lastCustomEventType') || '';
  });
  const [showCustomInput, setShowCustomInput] = useState(() => {
    const savedType = localStorage.getItem('lastEventType');
    return savedType === 'autre';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sauvegarder le type d'événement dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('lastEventType', eventType);
  }, [eventType]);

  useEffect(() => {
    if (customEventType) {
      localStorage.setItem('lastCustomEventType', customEventType);
    }
  }, [customEventType]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const membersRes = await membersAPI.getAll();
        const activeMembers = membersRes.data.filter(m => m.status === 'actif');

        const attendanceRes = await attendanceAPI.getByDate(selectedDate);

        setMembers(activeMembers || []);
        setAttendance(attendanceRes.data || []);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.response?.data?.message || err.message);
        setMembers([]);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleMark = async ({ memberId, status, reason, arrivalTime }) => {
    try {
      const finalEventType = eventType === 'autre' 
        ? customEventType || 'Autre' 
        : eventType === 'culte' 
          ? 'Culte' 
          : 'Répétition';

      const { data } = await attendanceAPI.mark({
        memberId,
        date: selectedDate,
        status,
        reason,
        arrivalTime,
        type: finalEventType
      });

      setAttendance(prev => {
        const existing = prev.findIndex(a => 
          (a.member?._id || a.member) === memberId
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [...prev, data];
      });
    } catch (err) {
      console.error('❌ Error:', err);
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Présences</h1>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Sélecteur de type d'événement */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Type d'événement
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setEventType('repetition');
              setShowCustomInput(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              eventType === 'repetition'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎵 Répétition
          </button>
          <button
            onClick={() => {
              setEventType('culte');
              setShowCustomInput(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              eventType === 'culte'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⛪ Culte
          </button>
          <button
            onClick={() => {
              setEventType('autre');
              setShowCustomInput(true);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              eventType === 'autre'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ✏️ Autre
          </button>
        </div>
        
        {showCustomInput && (
          <input
            type="text"
            placeholder="Veuillez préciser le type d'événement..."
            value={customEventType}
            onChange={(e) => setCustomEventType(e.target.value)}
            className="mt-3 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
          />
        )}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-400">Chargement...</p>
        ) : error ? (
          <p className="p-6 text-red-400">Erreur: {error}</p>
        ) : members.length === 0 ? (
          <p className="p-6 text-gray-400">
            Aucun membre actif. Vérifie que tes membres ont le statut "actif".
          </p>
        ) : (
          <AttendanceTable
            members={members}
            attendance={attendance}
            onMark={handleMark}
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;
