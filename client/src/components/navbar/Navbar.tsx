import { useState, useEffect } from 'react';
import { BarChart3, BookOpen, FileQuestion, Menu, X } from 'lucide-react';
import { useAuth } from '@/utils/auth';
import NavbarLogo from './NavbarLogo';
import NavLinks from './NavLinks';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navItems = [
    { name: 'Beranda', path: '/' },
    ...(user
      ? [
          { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4 mr-1" /> },
          { name: 'Ujian', path: '/exams', icon: <BookOpen className="w-4 h-4 mr-1" /> }
        ]
      : []),
    ...(role === 'admin'
      ? [{ name: 'Panel Admin', path: '/admin' }]
      : []),
    ...(role === 'questioner'
      ? [{ 
          name: 'Kelola Soal', 
          path: '/questioner',
          icon: <FileQuestion className="w-4 h-4 mr-1" />
        }]
      : []),
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <NavbarLogo />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLinks items={navItems} />
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <UserMenu />
            ) : (
              <div className="hidden sm:flex sm:items-center sm:space-x-2">
                <a
                  href="/auth?mode=login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Masuk
                </a>
                <a
                  href="/auth?mode=register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Daftar
                </a>
              </div>
            )}
            
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Buka menu utama</span>
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu isOpen={isOpen} items={navItems} onClose={closeMenu} />
    </nav>
  );
};

export default Navbar;
