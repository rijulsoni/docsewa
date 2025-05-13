
import React from 'react';
import FileUploadZone from './FileUploadZone'

interface HeroSectionProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  multiple?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  onFileChange,
  onDrop,
  onDragOver,
  multiple = false
}) => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Transform Your Documents with Ease
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Convert, merge, and extract text from your documents in seconds.
            No installation required — easy, secure, and free.
          </p>
          
          <FileUploadZone 
            onFileChange={onFileChange}
            onDrop={onDrop}
            onDragOver={onDragOver}
            multiple={multiple}
          />
          
          <div className="flex justify-center">
            <a 
              href="#features" 
              className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
              Explore All Tools
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;