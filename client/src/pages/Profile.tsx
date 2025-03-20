import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserCircle, Key, BellRing } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Pengaturan Akun</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>Password</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            <span>Notifikasi</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Informasi Profil</h2>
              <p className="text-gray-500">Kelola informasi profil Anda.</p>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <ChangePasswordForm />
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Notifikasi</h2>
              <p className="text-gray-500">Kelola preferensi notifikasi Anda.</p>
            </CardHeader>
            <CardContent>
              <p>Fitur ini akan segera hadir.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 