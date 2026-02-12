import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music4, Mail, ArrowRight, Check } from 'lucide-react';
import axios from 'axios';

const ResendVerification = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de l\'envoi de l\'email'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-bg min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-8 shadow-2xl shadow-black/40 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/25">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-100 mb-3">
              Email envoyé !
            </h2>
            
            <p className="text-neutral-400 mb-6">
              Un nouvel email de vérification a été envoyé à <span className="text-indigo-400 font-medium">{email}</span>
            </p>
            
            <p className="text-neutral-500 text-sm mb-6">
              Vérifiez votre boîte de réception et cliquez sur le lien pour activer votre compte.
            </p>

            <Link
              to="/login"
              className="inline-block px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl font-semibold text-sm text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/25">
            <Music4 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            Worship Team
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Renvoyer l'email de vérification
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <h2 className="text-base font-semibold text-neutral-200 mb-5">
            Renvoyer l'email
          </h2>

          <p className="text-sm text-neutral-400 mb-6">
            Entrez votre adresse email et nous vous enverrons un nouveau lien de vérification.
          </p>

          {error && (
            <div className="mb-4 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-800/60 border border-neutral-700/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 outline-none text-sm text-neutral-100 placeholder-neutral-600 transition"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  Envoyer l'email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-neutral-400 hover:text-neutral-200 transition"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
