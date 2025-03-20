import { Link, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface NavLinksProps {
  items: NavItem[];
  mobile?: boolean;
  onClick?: () => void;
}

const NavLinks = ({ items, mobile = false, onClick }: NavLinksProps) => {
  const location = useLocation();
  
  if (items.length === 0) return null;
  
  return (
    <div className={mobile 
      ? "flex flex-col space-y-2 pt-2 pb-3" 
      : "hidden md:flex items-center space-x-1 lg:space-x-4"
    }>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`${
            mobile
              ? `px-3 py-2.5 rounded-lg text-base font-medium flex items-center space-x-3 transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                }`
              : `px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  location.pathname === item.path
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                }`
          }`}
          onClick={onClick}
        >
          {item.icon && <span className={`${mobile ? 'w-5 h-5' : 'w-4 h-4'}`}>{item.icon}</span>}
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
