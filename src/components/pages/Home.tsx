"use client"
import React, { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'

import FeaturesSection from './FeaturesSection'
import HowItWorks from './HowItWorks'
import ActionSelectionGrid from './ActionSelectionGrid'
import FileRearrangement from './FileRearrangement'
import Navbar from './Navbar'
import HeroSection from './HeroSection'
import Footer from './Footer'

const Home = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArrangementModalOpen, setIsArrangementModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileArray = Array.from(event.target.files);
      setFiles(fileArray);
      setIsArrangementModalOpen(true);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const fileArray = Array.from(event.dataTransfer.files);
      setFiles(fileArray);
      setIsArrangementModalOpen(true);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFilesReordered = (reorderedFiles: File[]) => {
    setFiles(reorderedFiles);
  };

  const handleContinueArrangement = () => {
    setIsArrangementModalOpen(false);
    setIsModalOpen(true);
  };

  const handleCloseArrangement = () => {
    setIsArrangementModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with File Upload */}
        <HeroSection 
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          multiple={true}
        />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* How It Works Section */}
        <HowItWorks />
        
        {/* Simple CTA Section */}
        <section className="py-16 bg-docsewa-500 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to convert your documents?</h2>
            <p className="mb-8 max-w-2xl mx-auto">
              Get started now with our free document tools
            </p>
            <Button 
              className="bg-white text-docsewa-600 hover:bg-gray-100"
              size="lg"
              onClick={() => document.getElementById('upload-trigger')?.click()}
            >
              Start Converting
            </Button>
            <input 
              id="upload-trigger" 
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
            />
          </div>
        </section>
      </main>
      
      {/* File Rearrangement Modal/Drawer */}
      {isMobile ? (
        <Drawer open={isArrangementModalOpen} onOpenChange={setIsArrangementModalOpen}>
          <DrawerContent className="h-[85vh] max-h-[85vh]">
            <div className="px-1 py-1 h-full">
              <FileRearrangement 
                files={files}
                onFilesReordered={handleFilesReordered}
                onClose={handleCloseArrangement}
                onContinue={handleContinueArrangement}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isArrangementModalOpen} onOpenChange={setIsArrangementModalOpen}>
          <DialogContent className="sm:max-w-[900px] p-0">
            <FileRearrangement 
              files={files}
              onFilesReordered={handleFilesReordered}
              onClose={handleCloseArrangement}
              onContinue={handleContinueArrangement}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Action Selection Modal/Drawer */}
      {isMobile ? (
        <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DrawerContent>
            <div className="px-4 py-4">
              <h3 className="text-lg font-medium mb-2">Choose an Action</h3>
              <p className="text-sm text-gray-500 mb-4">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
              <ActionSelectionGrid filename={files.length > 0 ? files[0].name : ""} />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <h3 className="text-lg font-medium mb-2">Choose an Action</h3>
            <p className="text-sm text-gray-500 mb-4">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <ActionSelectionGrid filename={files.length > 0 ? files[0].name : ""} />
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <Footer />
    </div>
  );
};

export default Home;