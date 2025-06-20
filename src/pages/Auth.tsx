import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [secret, setSecret] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Eroare la autentificare",
            description: error.message,
            variant: "destructive",
          });
        } else {
          navigate("/");
        }
      } else {
        if (email !== confirmEmail) {
          setEmailError("Adresele de email nu coincid.");
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, secret);
        if (error) {
          toast({
            title: "Eroare la înregistrare",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Cont creat cu succes!",
            description: "ENJOY! Te poți autentifica acum.",
          });
          setTimeout(() => {
            setIsLogin(true);
            navigate("/auth");
          }, 1200);
        }
      }
    } catch (error) {
      toast({
        title: "A apărut o eroare",
        description: "Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Demo login handler
  const handleDemoLogin = async () => {
    setLoading(true);
    setEmail("demo@super.vara");
    setPassword("supervara");
    try {
      const { error } = await signIn("demo@super.vara", "supervara");
      if (error) {
        toast({
          title: "Eroare la autentificare demo",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "A apărut o eroare demo",
        description: "Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-2 text-center text-gray-700 text-base">
          Dacă vrei să încerci aplicația rapid, folosește contul demo de mai
          jos.
          <br />
          <b>ATENȚIE:</b> Pentru acces părinte sau funcții speciale, secretul
          este <b>supervara</b>.
        </div>
        <button
          onClick={handleDemoLogin}
          className="mb-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200"
          disabled={loading}
        >
          CONT DEMO (demo@super.vara / supervara)
        </button>
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 whitespace-nowrap ">
              🌟 Salutare Super Vară 🌟
            </h1>
            <p className="text-gray-600">
              {isLogin ? "Conectează-te la cont" : "Creează un cont nou"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Familia
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Familia Popescu"
                  autoComplete="family-name"
                  required
                />
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmă emailul
                </label>
                <input
                  type="email"
                  id="confirmEmail"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {emailError && (
                  <div className="text-red-600 text-sm mt-1">{emailError}</div>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Parolă acces aplicație
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="secret"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cod acces părinte (secret)
                </label>
                <input
                  type="password"
                  id="secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
            >
              {loading
                ? "Se încarcă..."
                : isLogin
                ? "Conectează-te"
                : "Creează cont"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              {isLogin
                ? "Nu ai cont? Creează unul aici"
                : "Ai deja cont? Conectează-te aici"}
            </button>
          </div>
        </div>
        <div className="text-center text-xs mt-4">
          <a
            href="https://ovidiuchis.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#eec213] hover:text-amber-500 transition-colors"
          >
            by O
          </a>
        </div>
      </div>{" "}
    </Layout>
  );
};

export default Auth;
