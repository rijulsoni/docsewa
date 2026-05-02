"use client"
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorks from './HowItWorks';
import ActionSelectionGrid from './ActionSelectionGrid';
import FileRearrangement from './FileRearrangement';
import ConversionOptions from './ConversionOptions';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Link from 'next/link';
import ScrollToTop from './ScrollToTop';

const Home = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArrangementModalOpen, setIsArrangementModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(Array.from(event.target.files));
      setIsOptionsModalOpen(true);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFiles(Array.from(event.dataTransfer.files));
      setIsOptionsModalOpen(true);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFilesReordered = (reorderedFiles: File[]) => setFiles(reorderedFiles);
  const handleContinueArrangement = () => { setIsArrangementModalOpen(false); setIsModalOpen(true); };
  const handleCloseArrangement = () => setIsArrangementModalOpen(false);
  const handleCloseOptions = () => setIsOptionsModalOpen(false);


  return (
    <div className="min-h-screen bg-[#050506] flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <HeroSection
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          multiple
        />

        <FeaturesSection />
        <HowItWorks />

        {/* CTA */}
        <section className="py-12 sm:py-24 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-violet-900/20 pointer-events-none" />

          <div className="relative container mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-6">
              Get started
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold gradient-text mb-5 leading-tight">
              Ready to convert?
            </h2>
            <p className="text-white/40 max-w-md mx-auto text-base mb-10">
              Upload any file above or jump directly to a tool — it&apos;s completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.svg,.bmp,.docx,.xlsx,.xls,.csv"
                  multiple
                />
                <span className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl transition-all shadow-[0_4px_20px_rgba(94,106,210,0.4)] hover:shadow-[0_4px_30px_rgba(94,106,210,0.6)] text-sm min-w-[160px]">
                  Upload &amp; Convert
                </span>
              </label>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold border border-white/[0.18] text-white/65 hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all min-w-[160px]"
              >
                Browse Tools
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Conversion Options Modal */}
      {isMobile ? (
        <Drawer open={isOptionsModalOpen} onOpenChange={setIsOptionsModalOpen}>
          <DrawerContent className="bg-[#0d0d0f] border-t border-white/[0.08]">
            <ConversionOptions files={files} onClose={handleCloseOptions} />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOptionsModalOpen} onOpenChange={setIsOptionsModalOpen}>
          <DialogContent className="sm:max-w-[560px] p-0 border-0 bg-transparent shadow-2xl [&>button:last-child]:hidden">
            <VisuallyHidden><DialogTitle>Choose conversion type</DialogTitle></VisuallyHidden>
            <ConversionOptions files={files} onClose={handleCloseOptions} />
          </DialogContent>
        </Dialog>
      )}

      {/* File Rearrangement Modal */}
      {isMobile ? (
        <Drawer open={isArrangementModalOpen} onOpenChange={setIsArrangementModalOpen}>
          <DialogTitle><VisuallyHidden>Rearrange files</VisuallyHidden></DialogTitle>
          <DrawerContent className="h-[85vh] max-h-[85vh] bg-[#0d0d0f] border-t border-white/[0.08]">
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
          <DialogTitle><VisuallyHidden>Rearrange files</VisuallyHidden></DialogTitle>
          <DialogContent className="sm:max-w-[900px] p-0 bg-[#0d0d0f] border border-white/[0.08]">
            <FileRearrangement
              files={files}
              onFilesReordered={handleFilesReordered}
              onClose={handleCloseArrangement}
              onContinue={handleContinueArrangement}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Action Selection Modal */}
      {isMobile ? (
        <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTitle><VisuallyHidden>Choose an Action</VisuallyHidden></DialogTitle>
          <DrawerContent className="bg-[#0d0d0f] border-t border-white/[0.08]">
            <div className="px-4 py-6">
              <p className="text-xs text-white/35 mb-4">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
              <ActionSelectionGrid filename={files.length > 0 ? files[0].name : ''} />
              <button
                className="mt-4 w-full py-2 text-sm text-white/30 hover:text-white/60 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTitle><VisuallyHidden>Choose an Action</VisuallyHidden></DialogTitle>
          <DialogContent className="sm:max-w-[480px] bg-[#0d0d0f] border border-white/[0.08]">
            <h3 className="text-base font-semibold text-white mb-1">Choose an Action</h3>
            <p className="text-xs text-white/35 mb-5">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <ActionSelectionGrid filename={files.length > 0 ? files[0].name : ''} />
            <button
              className="mt-4 w-full py-2 text-sm text-white/30 hover:text-white/60 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </DialogContent>
        </Dialog>
      )}

      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default Home;
