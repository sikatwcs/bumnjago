import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, FileText, ShoppingCart, Book, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/supabase";

interface Ownership {
  id: number;
  userId: number;
  tryoutListId: number;
  isDone: boolean;
  tryoutList: {
    id: number;
    title: string;
    price: number;
    imageUrl: string | null;
    description: string | null;
    batch: number;
    type: string;
    status: boolean;
    isOnline: boolean;
  };
}

interface TryoutList {
  id: number;
  title: string;
  price: number;
  imageUrl: string | null;
  description: string | null;
  batch: number;
  type: string;
  status: boolean;
  isOnline: boolean;
}

const Tryout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [availableTryouts, setAvailableTryouts] = useState<TryoutList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      fetchOwnedTryouts();
      fetchAvailableTryouts();
    }
  }, [user, navigate]);

  const fetchOwnedTryouts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/tryout/owned');
      setOwnerships(response.data);
    } catch (error) {
      console.error('Error fetching owned tryouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTryouts = async () => {
    try {
      const response = await api.get('/tryout/available');
      setAvailableTryouts(response.data);
    } catch (error) {
      console.error('Error fetching available tryouts:', error);
    }
  };

  const handleStartTryout = (id: number) => {
    navigate(`/tryout/${id}`);
  };

  const handleBuyTryout = (id: number) => {
    navigate(`/checkout/${id}`);
  };

  const filteredOwnerships = ownerships.filter(ownership => 
    ownership.tryoutList.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableTryouts = availableTryouts.filter(tryout => 
    tryout.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Tryout Saya</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/avatars/default.png" alt="Profile" />
                <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative">
          <Input
            type="search"
            placeholder="Cari tryout..."
            className="pl-10 pr-4 py-2 w-full rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {ownerships.length > 0 ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Tryout Saya</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOwnerships.map((ownership) => (
                    <div key={ownership.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="h-40 bg-gray-200">
                        {ownership.tryoutList.imageUrl ? (
                          <img 
                            src={ownership.tryoutList.imageUrl} 
                            alt={ownership.tryoutList.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-yellow-100">
                            <FileText className="w-12 h-12 text-yellow-500" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg">{ownership.tryoutList.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${ownership.isDone ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {ownership.isDone ? 'Selesai' : 'Belum Selesai'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Batch {ownership.tryoutList.batch} • {ownership.tryoutList.type}</p>
                        <div className="mt-4">
                          <Button 
                            onClick={() => handleStartTryout(ownership.tryoutList.id)}
                            className={`w-full ${ownership.isDone ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                          >
                            {ownership.isDone ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Lihat Hasil
                              </>
                            ) : (
                              <>
                                <Book className="w-4 h-4 mr-2" />
                                Mulai Tryout
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100">
                  <AlertCircle className="h-12 w-12 text-yellow-500" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Belum Ada Tryout</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                  Kamu belum memiliki akses tryout. Silakan beli paket tryout untuk mulai berlatih.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => window.location.href = '#available-tryouts'}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Beli Paket Tryout
                  </Button>
                </div>
              </div>
            )}

            {/* Available Tryouts Section */}
            <div id="available-tryouts" className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Paket Tryout Tersedia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAvailableTryouts.map((tryout) => (
                  <div key={tryout.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-40 bg-gray-200">
                      {tryout.imageUrl ? (
                        <img 
                          src={tryout.imageUrl} 
                          alt={tryout.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-yellow-100">
                          <FileText className="w-12 h-12 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">{tryout.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Batch {tryout.batch} • {tryout.type}</p>
                      <p className="text-sm text-gray-600 mt-3 truncate">
                        {tryout.description || "Tidak ada deskripsi"}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="font-semibold text-lg text-yellow-600">
                          Rp {(tryout.price).toLocaleString()}
                        </span>
                        <Button 
                          onClick={() => handleBuyTryout(tryout.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Beli
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Tryout; 