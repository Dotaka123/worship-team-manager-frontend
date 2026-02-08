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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, attendanceRes] = await Promise.all([
          membersAPI.getAll({ active: 'true' }),
          attendanceAPI.getByDate(selectedDate)
        ]);
        setMembers(membersRes.data);
        setAttendance(attendanceRes.data);
      } catch (error) {
        console.error('Erreur:', error);
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
      
      // Mettre à jour l'état local
      setAttendance(prev => {
        const existing = prev.findIndex(a => 
          (a.member?._id || a.member) === memberId
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], status, reason };
          return updated;
        }
        return [...prev, { ...data, member: memberId }];
      });
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Présences</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
        />
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-400">Chargement...</p>
        ) : members.length === 0 ? (
          <p className="p-6 text-gray-400">Aucun membre actif</p>
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
