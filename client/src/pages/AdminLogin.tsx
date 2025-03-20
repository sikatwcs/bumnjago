import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    console.log("Attempting admin login...", { email });
    
    try {
      const success = await login(email, password);
      
      console.log("Login result:", success);
      
      if (success) {
        // Redirect ke dashboard admin
        const from = location.state?.from?.pathname || "/admin/dashboard";
        // Pastikan path tidak mengandung /login
        const redirectPath = from.includes('/login') ? '/admin/dashboard' : from;
        console.log("Redirecting to:", redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        console.error("Login failed");
        setError("Email atau password tidak valid");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan email dan password admin untuk melanjutkan
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>
        <div className="text-center text-sm mt-4">
          <span className="text-gray-600">Kembali ke </span>
          <button
            onClick={() => navigate("/")}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Halaman Utama
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 