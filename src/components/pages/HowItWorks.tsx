import React from 'react';
import { Upload, FileText } from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete your document tasks in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-docsewa-100 rounded-full flex items-center justify-center text-docsewa-600 relative">
                <Upload className="h-6 w-6" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-docsewa-500 text-white flex items-center justify-center text-sm font-medium">
                  1
                </div>
              </div>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Upload</h3>
            <p className="text-gray-500 text-center text-sm">
              Upload your files or drag and drop them
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-docsewa-100 rounded-full flex items-center justify-center text-docsewa-600 relative">
                <FileText className="h-6 w-6" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-docsewa-500 text-white flex items-center justify-center text-sm font-medium">
                  2
                </div>
              </div>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Convert</h3>
            <p className="text-gray-500 text-center text-sm">
              Choose your preferred conversion options
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-docsewa-100 rounded-full flex items-center justify-center text-docsewa-600 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-docsewa-500 text-white flex items-center justify-center text-sm font-medium">
                  3
                </div>
              </div>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Download</h3>
            <p className="text-gray-500 text-center text-sm">
              Download your converted files instantly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;