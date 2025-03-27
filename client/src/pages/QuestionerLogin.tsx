import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionerAuth } from '@/contexts/QuestionerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const QuestionerLogin = () => {
  const navigate = useNavigate();
  const { questioner, login } = useQuestionerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (questioner) {
      navigate('/questioner/dashboard');
    }
  }, [questioner, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Submitting login form...', { email });
      
      await login(email, password);
      
      console.log('Login successful, redirecting...');
      toast.success('Login berhasil');
      
      // Tambahkan delay kecil sebelum redirect untuk memastikan state terupdate
      setTimeout(() => {
        navigate('/questioner/dashboard');
      }, 100);
    } catch (error: any) {
      console.error('Login form error:', {
        message: error.message,
        error
      });
      
      toast.error(error.message || 'Gagal masuk ke sistem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="font-bold text-2xl text-red-600">Jago</span>
            <span className="font-bold text-2xl">CPNS</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Login Questioner</h1>
          <p className="text-gray-600">Masuk ke dashboard questioner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default QuestionerLogin; 