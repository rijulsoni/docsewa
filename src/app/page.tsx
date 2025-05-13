
import React from 'react';
import { ChevronRight, FileText, FilePlus, Image, FileImage, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Home from '@/components/pages/Home';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <Home />
      </div>

      <section className="bg-gradient-to-r from-docsewa-600 to-blue-600 py-12 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Documents?</h2>
            <p className="text-xl mb-8">
              Powerful document tools designed for your workflow. Convert, merge, and manage with ease.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <Link href="/image-to-pdf" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-xl p-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Image className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Image to PDF</h3>
                <p className="text-white/80 mb-4 text-center">Convert your images to professional PDF documents</p>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-docsewa-600 mt-auto">
                  Get Started <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/pdf-merge" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-xl p-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <FilePlus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Merge PDFs</h3>
                <p className="text-white/80 mb-4 text-center">Combine multiple PDF files into a single document</p>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-docsewa-600 mt-auto">
                  Get Started <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Extract Text</h3>
                <p className="text-white/80 mb-4 text-center">Extract text content from your PDF documents</p>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-docsewa-600 mt-auto opacity-75">
                  Coming Soon
                </Button>
              </div>
            </div>
            <p className="text-white/80 text-sm">
              All your files are processed securely. We don't store your documents.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
