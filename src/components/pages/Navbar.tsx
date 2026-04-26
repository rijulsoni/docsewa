import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DocSewa
          </span>
        </Link>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Home
          </Link>
          <Link href="/image-to-pdf" className="text-gray-700 hover:text-blue-600 font-medium">
            Image to PDF
          </Link>
          <Link href="/pdf-to-image" className="text-gray-700 hover:text-blue-600 font-medium">
            PDF to Image
          </Link>
          <Link href="/merge-pdf" className="text-gray-700 hover:text-blue-600 font-medium">
            Merge PDF
          </Link>
          <Link href="/extract-text" className="text-gray-700 hover:text-blue-600 font-medium">
            Extract Text
          </Link>
        </div>
        
        <div className="md:hidden">
          {/* Mobile menu button if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
