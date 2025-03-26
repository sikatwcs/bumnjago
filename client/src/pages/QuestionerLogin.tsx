import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuestionerAuth } from "@/contexts/QuestionerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const QuestionerLogin = () => {
  const navigate = useNavigate();
  const { login } = useQuestionerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    console.log("Attempting questioner login...", { email });
    
    try {
      const success = await login(email, password);
      
      console.log("Login result:", success);
      
      if (success) {
        // Redirect ke dashboard questioner
        console.log("Redirecting to questioner dashboard");
        navigate('/questioner/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] px-4">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span className="font-bold text-2xl text-red-600">Jago</span>
            <span className="font-bold text-2xl">CPNS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Login Questioner</h1>
          <p className="text-gray-600">
            Masuk sebagai pembuat soal CBT BUMN
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Kembali ke{" "}
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

export default QuestionerLogin; 