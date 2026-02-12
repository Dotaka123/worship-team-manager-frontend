import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music4, Eye, EyeOff, ArrowRight, Mail, User, Lock, Check } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Tous les champs sont requis');
      return false;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer un email valide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      if (response.data.requiresVerification) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
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
              Vérifiez votre email
            </h2>
            
            <p className="text-neutral-400 mb-6">
              Un email de vérification a été envoyé à <span className="text-indigo-400 font-medium">{email}</span>
            </p>
            
            <p className="text-neutral-500 text-sm mb-6">
              Cliquez sur le lien dans l'email pour activer votre compte. Le lien est valide pendant 24 heures.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl font-semibold text-sm text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Retour à la connexion
              </Link>
              
              <button
                onClick={() => navigate('/resend-verification', { state: { email } })}
                className="text-sm text-neutral-400 hover:text-neutral-200 transition"
              >
                Renvoyer l'email de vérification
              </button>
            </div>
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
            Créez votre compte
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <h2 className="text-base font-semibold text-neutral-200 mb-5">
            Inscription
          </h2>

          {error && (
            <div className="mb-4 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-800/60 border border-neutral-700/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 outline-none text-sm text-neutral-100 placeholder-neutral-600 transition"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-800/60 border border-neutral-700/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 outline-none text-sm text-neutral-100 placeholder-neutral-600 transition"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-800/60 border border-neutral-700/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 outline-none text-sm text-neutral-100 placeholder-neutral-600 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">
                Minimum 6 caractères
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-800/60 border border-neutral-700/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 outline-none text-sm text-neutral-100 placeholder-neutral-600 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                >
                  {showConfirmPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
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
                  Inscription...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
