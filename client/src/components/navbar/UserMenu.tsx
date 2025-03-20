
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/utils/auth';

type UserMenuProps = {
  mobile?: boolean;
  onClose?: () => void;
};

const UserMenu = ({ mobile = false, onClose }: UserMenuProps) => {
  const { user, logout } = useAuth();
  
  if (!user) {
    return (
      <div className={mobile ? "border-t border-gray-200 pt-4 space-y-2" : "flex items-center space-x-2"}>
        <Link
          to="/auth?mode=login"
          className={mobile ? "block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600" : ""}
          onClick={onClose}
        >
          <Button variant="ghost">Log in</Button>
        </Link>
        <Link
          to="/auth?mode=register"
          className={mobile ? "block px-3 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 text-center" : ""}
          onClick={onClose}
        >
          <Button>Sign up</Button>
        </Link>
      </div>
    );
  }
  
  if (mobile) {
    return (
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          onClick={onClose}
        >
          <User className="w-5 h-5 mr-2" />
          Profile
        </Link>
        <button
          className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="ghost" 
        className="flex items-center text-gray-600 hover:text-blue-600"
        onClick={logout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        <span>Logout</span>
      </Button>
      <Link 
        to="/dashboard" 
        className="flex items-center space-x-2 px-3 py-2 rounded-full bg-blue-50 text-blue-700"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">{user.name || 'Profile'}</span>
      </Link>
    </div>
  );
};

export default UserMenu;
