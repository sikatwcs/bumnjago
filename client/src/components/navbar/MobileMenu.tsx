import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavLinks from './NavLinks';
import UserMenu from './UserMenu';

interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface MobileMenuProps {
  isOpen: boolean;
  items: NavItem[];
  onClose: () => void;
}

const MobileMenu = ({ isOpen, items, onClose }: MobileMenuProps) => {
  return (
    <div 
      className={`
        fixed inset-0 z-50 lg:hidden
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Menu Content */}
      <div className="relative w-[280px] h-full bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-red-600">Jago</span>
            <span className="font-bold text-xl">CPNS</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          <NavLinks items={items} mobile onClick={onClose} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t">
          <div className="p-4">
            <UserMenu mobile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
