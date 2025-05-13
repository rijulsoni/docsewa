
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  path,
  gradient
}) => {
  return (
    <Link href={path} className="block group">
      <div className={`rounded-xl p-6 h-full bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-docsewa-200 ${gradient}`}>
        <div className="flex flex-col h-full">
          <div className="rounded-full bg-white p-3 w-16 h-16 flex items-center justify-center mb-4 text-docsewa-600 border border-gray-100">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">
            {title}
          </h3>
          <p className="text-gray-600 mb-6 flex-grow">
            {description}
          </p>
          <div className="mt-auto">
            <span className="inline-flex items-center text-docsewa-600 font-medium group-hover:underline">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;