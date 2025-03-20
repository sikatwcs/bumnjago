
import { Link } from 'react-router-dom';

const NavbarLogo = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Link 
      to="/"
      className="flex items-center space-x-2"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
        <span className="text-white font-bold text-xl">CB</span>
      </div>
      <span className="text-xl font-semibold text-blue-900">BlueCBT</span>
    </Link>
  );
};

export default NavbarLogo;
