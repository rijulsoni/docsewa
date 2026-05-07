"use client"

import React from 'react';
import Navbar from '@/components/pages/Navbar';
import { PdfEditor } from '@/components/pdf-editor/PdfEditor';

export default function PdfEditorPage() {
  return (
    <div className="min-h-screen bg-[#050506] flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <PdfEditor />
      </main>
    </div>
  );
}
