import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { questionerAPI } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const QuestionerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await questionerAPI.login(email, password);
      
      // Simpan token
      localStorage.setItem("questioner-token", response.data.token);
      
      toast.success("Login berhasil");
      navigate("/questioner/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
          >
            {loading ? (
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