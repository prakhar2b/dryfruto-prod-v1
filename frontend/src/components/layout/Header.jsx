import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Search, Heart, User } from 'lucide-react';
import { LOGO_URL, CONTACT_INFO, categories } from '../../data/mock';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#2d1810] text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <a href={CONTACT_INFO.callLink} className="hover:text-amber-300 transition-colors">
              Call us: {CONTACT_INFO.phone}
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>Free Shipping on orders above ₹500</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-[#3d2518] shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={LOGO_URL} 
                alt="DryFruto" 
                className="h-14 w-14 rounded-full object-cover border-2 border-amber-400"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">DryFruto</h1>
                <p className="text-xs text-amber-300 italic">Live With Health</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-white hover:text-amber-300 transition-colors font-medium">
                Home
              </Link>
              <div className="relative group">
                <button className="text-white hover:text-amber-300 transition-colors font-medium flex items-center gap-1">
                  Categories
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 bg-white shadow-xl rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/products" className="text-white hover:text-amber-300 transition-colors font-medium">
                All Products
              </Link>
              <Link to="/products?category=gift-boxes" className="text-white hover:text-amber-300 transition-colors font-medium">
                Gift Boxes
              </Link>
              <a href="#about" className="text-white hover:text-amber-300 transition-colors font-medium">
                About Us
              </a>
              <a href="#contact" className="text-white hover:text-amber-300 transition-colors font-medium">
                Contact
              </a>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-white hover:text-amber-300 transition-colors p-2"
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-amber-300 transition-colors p-2 hidden md:block">
                <Heart className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-amber-300 transition-colors p-2 hidden md:block">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white lg:hidden p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="pb-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for dry fruits, nuts, seeds..."
                  className="flex-1 px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-amber-400 outline-none"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#2d1810] border-t border-amber-900">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <nav className="flex flex-col gap-3">
                <Link 
                  to="/" 
                  className="text-white hover:text-amber-300 py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <div className="border-t border-amber-900 pt-2">
                  <p className="text-amber-400 text-sm font-medium mb-2">Categories</p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="block text-white hover:text-amber-300 py-1.5 pl-2 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <Link 
                  to="/products" 
                  className="text-white hover:text-amber-300 py-2 border-t border-amber-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Products
                </Link>
                <Link 
                  to="/products?category=gift-boxes" 
                  className="text-white hover:text-amber-300 py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Gift Boxes
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
