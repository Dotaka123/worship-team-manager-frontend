import { useEffect, useState } from 'react';
import { X, Cake, Gift, PartyPopper } from 'lucide-react';

const BirthdayConfetti = ({ member, onClose }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Générer les confettis
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 3 + Math.random() * 2,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce', '#52be80'][Math.floor(Math.random() * 6)]
      });
    }
    setConfetti(pieces);

    // Auto-fermer après 10 secondes
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const age = member.age || '?';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}

      {/* Card */}
      <div className="relative max-w-md w-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center text-white">
          {/* Emoji/Icons */}
          <div className="flex justify-center gap-3 mb-6 animate-bounce">
            <Cake className="w-12 h-12" />
            <Gift className="w-12 h-12" />
            <PartyPopper className="w-12 h-12" />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 animate-pulse">
            Joyeux Anniversaire !
          </h2>

          {/* Member name */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4">
            <p className="text-2xl sm:text-3xl font-bold mb-2">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-lg opacity-90">
              🎂 {age} ans aujourd'hui !
            </p>
          </div>

          {/* Message */}
          <p className="text-lg opacity-90 mb-6">
            Que cette nouvelle année soit remplie de bénédictions, 
            de joie et de moments inoubliables ! 🎉
          </p>

          {/* Photo if available */}
          {member.photo && (
            <div className="flex justify-center mb-6">
              <img
                src={member.photo}
                alt={`${member.firstName} ${member.lastName}`}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
            </div>
          )}

          {/* Button */}
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white text-purple-600 font-bold rounded-full hover:bg-gray-100 transition transform hover:scale-105"
          >
            Merci ! 🎈
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16 animate-pulse" />
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BirthdayConfetti;
