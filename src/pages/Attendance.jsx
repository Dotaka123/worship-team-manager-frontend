import { useState, useEffect } from 'react';
import { membersAPI, attendanceAPI } from '../services/api';
import AttendanceTable from '../components/AttendanceTable';

const Attendance = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleMark = async ({ memberId, status, reason }) => {
    try {
      const { data } = await attendanceAPI.mark({
        memberId,
        date: selectedDate,
        status,
        reason
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
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
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
