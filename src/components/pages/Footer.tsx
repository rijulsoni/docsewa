import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold text-docsewa-600 bg-gradient-to-r from-docsewa-600 to-purple-600 bg-clip-text text-transparent">
              DocSewa
            </h3>
            <p className="mt-2 text-gray-600 max-w-md">
              Your all-in-one document conversion and manipulation tool. Convert, merge, and extract with ease.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase mb-2">Tools</h4>
              <ul className="text-gray-600">
                <li className="mb-2"><a href="/image-to-pdf" className="hover:text-docsewa-600">Image to PDF</a></li>
                <li className="mb-2"><a href="/pdf-to-image" className="hover:text-docsewa-600">PDF to Image</a></li>
                <li className="mb-2"><a href="/merge-pdf" className="hover:text-docsewa-600">Merge PDF</a></li>
                <li className="mb-2"><a href="/extract-text" className="hover:text-docsewa-600">Extract Text</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase mb-2">Help</h4>
              <ul className="text-gray-600">
                <li className="mb-2"><a href="#" className="hover:text-docsewa-600">FAQ</a></li>
                <li className="mb-2"><a href="#" className="hover:text-docsewa-600">Contact Us</a></li>
                <li className="mb-2"><a href="#" className="hover:text-docsewa-600">Privacy</a></li>
                <li className="mb-2"><a href="#" className="hover:text-docsewa-600">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-6 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} DocSewa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;