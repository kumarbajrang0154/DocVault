'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  ArrowLeft,
  Lock,
  Tag,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Camera,
  RotateCw,
  Plus,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { uploadDocumentAction } from '@/app/actions/documents';
import { jsPDF } from 'jspdf';

const CATEGORIES = [
  'ID Proof',
  'Education',
  'Insurance',
  'Financial',
  'Medical',
  'Vehicle',
  'Other',
];

export function DocumentUploadClient() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [noExpiry, setNoExpiry] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Camera Scan Modal States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPages, setCapturedPages] = useState<{ id: string; dataUrl: string; rotation: number }[]>([]);
  const [currentCapture, setCurrentCapture] = useState<{ dataUrl: string; rotation: number } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera tracks when modal closes
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
    setCurrentCapture(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setCurrentCapture(null);
    setIsCameraOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Camera access denied or unavailable. Please use regular file upload.';
      setCameraError(msg);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCurrentCapture({ dataUrl, rotation: 0 });
    }
    setIsCapturing(false);
  };

  const handleRotateCurrent = () => {
    if (!currentCapture) return;
    setCurrentCapture({
      ...currentCapture,
      rotation: (currentCapture.rotation + 90) % 360,
    });
  };

  const saveCurrentPage = () => {
    if (!currentCapture) return;

    // Apply rotation onto a new canvas if rotated
    if (currentCapture.rotation !== 0) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        if (currentCapture.rotation === 90 || currentCapture.rotation === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((currentCapture.rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);

          const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setCapturedPages((prev) => [
            ...prev,
            { id: `page_${Date.now()}_${prev.length}`, dataUrl: rotatedDataUrl, rotation: 0 },
          ]);
        }
        setCurrentCapture(null);
      };
      img.src = currentCapture.dataUrl;
    } else {
      setCapturedPages((prev) => [
        ...prev,
        { id: `page_${Date.now()}_${prev.length}`, dataUrl: currentCapture.dataUrl, rotation: 0 },
      ]);
      setCurrentCapture(null);
    }
  };

  const deleteCapturedPage = (id: string) => {
    setCapturedPages((prev) => prev.filter((p) => p.id !== id));
  };

  const compilePagesToPDF = () => {
    if (capturedPages.length === 0) {
      setErrorMessage('Please capture at least one page before completing scan.');
      return;
    }

    try {
      const pdf = new jsPDF();
      capturedPages.forEach((page, index) => {
        if (index > 0) {
          pdf.addPage();
        }
        const imgProps = pdf.getImageProperties(page.dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(page.dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      });

      const pdfBlob = pdf.output('blob');
      const filename = `Scanned_Doc_${new Date().toISOString().slice(0, 10)}.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      setSelectedFile(file);
      if (!title) {
        setTitle(`Camera Scan - ${new Date().toLocaleDateString()}`);
      }

      setSuccessMessage(`Captured ${capturedPages.length} page(s) and generated multi-page PDF!`);
      stopCamera();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF from scan.';
      setErrorMessage(msg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage('Selected file exceeds the 15MB size limit.');
        setSelectedFile(null);
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);

      if (!title) {
        const autoTitle = file.name.replace(/\.[0-9a-z]+$/i, '').replace(/[-_]/g, ' ');
        setTitle(autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select or scan a file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please enter a document title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('notes', notes);
      if (!noExpiry && expiryDate) {
        formData.append('expiryDate', expiryDate);
      }

      const res = await uploadDocumentAction(formData);

      if (res.success && res.documentId) {
        setSuccessMessage('Document uploaded and encrypted successfully!');
        setTimeout(() => {
          router.push(`/documents/${res.documentId}`);
        }, 1000);
      } else {
        setErrorMessage(res.error || 'Upload failed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/documents"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <UploadCloud className="h-6 w-6 text-emerald-400" />
              Upload Document
            </h1>
            <p className="text-xs text-zinc-400">
              Files are AES-256 encrypted server-side before R2 private storage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Lock className="h-3.5 w-3.5" />
          <span>AES-256 Encrypted</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs font-semibold text-rose-300">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload / Camera Scan Buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Document File (PDF or Image, max 15MB) <span className="text-rose-400">*</span>
              </label>

              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all cursor-pointer shadow-sm"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Scan with Camera</span>
              </button>
            </div>

            <div className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-zinc-950/60 p-6 text-center transition-all hover:border-blue-500/50 hover:bg-zinc-950/90">
              <input
                type="file"
                accept=".pdf,image/jpeg,image/jpg,image/png,image/webp,image/heic"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-white">{selectedFile.name}</span>
                  <span className="text-xs text-zinc-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                  </span>
                  <span className="mt-1 text-[11px] text-blue-400 font-semibold underline">
                    Click to replace file or choose another
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">
                    Click to browse, drag & drop, or use Scan with Camera
                  </span>
                  <span className="text-xs text-zinc-500">
                    PDF, JPEG, PNG, WEBP supported (Up to 15MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Document Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Passport - India, Car Insurance Policy"
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Expiry Date & Optional No-Expiry Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  Expiry Date (Optional)
                </span>
              </label>

              <input
                type="date"
                value={expiryDate}
                disabled={noExpiry}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={`w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer ${
                  noExpiry ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={noExpiry}
                  onChange={(e) => {
                    setNoExpiry(e.target.checked);
                    if (e.target.checked) setExpiryDate('');
                  }}
                  className="rounded border-white/20 bg-zinc-950 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-zinc-300 font-medium">
                  This document does not expire (e.g. Birth Certificate, Degree)
                </span>
              </label>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-purple-400" />
                <span>Tags (Comma separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Identity, Official, 2026"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Notes / Additional Details (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Policy number, issuer details, renewal reference notes..."
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <Link
              href="/documents"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Encrypting & Uploading...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Encrypt & Save Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Camera Scan Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl space-y-6 rounded-3xl border border-white/15 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-2xl">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Camera className="h-5 w-5 text-emerald-400" />
                <span>Camera Document Scanner</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {cameraError ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-950/40 p-6 text-center space-y-3">
                <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Camera Unavailable</h3>
                <p className="text-xs text-zinc-300 max-w-md mx-auto">{cameraError}</p>
                <p className="text-[11px] text-zinc-400">
                  You can still upload existing images or PDF files using the standard file selector.
                </p>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="mt-2 inline-flex h-9 items-center justify-center rounded-xl bg-white/10 px-4 text-xs font-bold text-white hover:bg-white/20"
                >
                  Return to Upload Form
                </button>
              </div>
            ) : currentCapture ? (
              /* Review / Crop / Rotate Step */
              <div className="space-y-4">
                <div className="text-xs text-zinc-300 flex items-center justify-between">
                  <span className="font-semibold text-emerald-400">Review & Adjust Photo</span>
                  <span className="text-zinc-400">Page {capturedPages.length + 1}</span>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 flex items-center justify-center min-h-[300px]">
                  {/* eslint-disable-next-html-element-suppression */}
                  <img
                    src={currentCapture.dataUrl}
                    alt="Current capture"
                    className="max-h-[350px] object-contain transition-transform duration-300"
                    style={{ transform: `rotate(${currentCapture.rotation}deg)` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRotateCurrent}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-zinc-200 hover:bg-white/10 cursor-pointer"
                  >
                    <RotateCw className="h-4 w-4 text-blue-400" />
                    <span>Rotate 90°</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentCapture(null)}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-400 hover:bg-white/10"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={saveCurrentPage}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Page ({capturedPages.length + 1})</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Live Camera Stream View */
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 min-h-[320px] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-h-[380px] object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-emerald-500/40 rounded-2xl margin-4" />
                </div>

                {/* Captured Thumbnails Strip */}
                {capturedPages.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Captured Pages ({capturedPages.length})
                    </span>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {capturedPages.map((page, idx) => (
                        <div
                          key={page.id}
                          className="relative group shrink-0 rounded-xl border border-white/15 bg-zinc-950 p-1"
                        >
                          {/* eslint-disable-next-html-element-suppression */}
                          <img
                            src={page.dataUrl}
                            alt={`Page ${idx + 1}`}
                            className="h-16 w-14 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => deleteCapturedPage(page.id)}
                            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <span className="block text-[10px] font-bold text-center text-zinc-400 mt-1">
                            P{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Camera Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Snap Photo</span>
                  </button>

                  {capturedPages.length > 0 && (
                    <button
                      type="button"
                      onClick={compilePagesToPDF}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Finish & Save PDF ({capturedPages.length} Pages)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
