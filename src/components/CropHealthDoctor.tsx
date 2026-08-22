import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  Activity, 
  Leaf, 
  Bug, 
  Droplets, 
  History, 
  Info, 
  ArrowRight,
  RotateCw,
  X,
  Printer,
  ChevronRight,
  TrendingDown,
  Award
} from 'lucide-react';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cn, formatCurrency } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DiagnosedIssue {
  issueName: string;
  category: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence: number;
  visualSymptoms: string;
}

interface MitigationStrategy {
  type: string;
  title: string;
  description: string;
}

interface CropDiagnosticResult {
  cropName: string;
  overallHealth: 'Healthy' | 'Mild Issues Detected' | 'Moderate Disease / Infection' | 'Severe Infection / Quality Degradation';
  healthScore: number;
  qualityGrade: string;
  diagnosedIssues: DiagnosedIssue[];
  mitigationStrategies: MitigationStrategy[];
  marketabilityInsight: string;
  preventativeAdvice: string;
}

interface SavedDiagnostic extends CropDiagnosticResult {
  id: string;
  imageUrl: string;
  createdAt: string;
  notes?: string;
}

// Sample Produce Presets for quick camera test
const SAMPLE_PRESETS = [
  {
    name: "Tomato Early Blight",
    crop: "Tomato",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
    notes: "Concentric rings and dark brown spots on lower leaves."
  },
  {
    name: "Healthy Organic Pepper",
    crop: "Bell Pepper",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80",
    notes: "Firm skin, vibrant green color, pristine harvest."
  },
  {
    name: "Powdery Mildew Grape",
    crop: "Grape",
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80",
    notes: "White powdery patches appearing on skin and leaves."
  },
  {
    name: "Citrus Canker / Spot",
    crop: "Citrus",
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80",
    notes: "Raised corky lesions surrounded by yellow halo."
  }
];

export default function CropHealthDoctor() {
  const [activeTab, setActiveTab] = useState<'camera' | 'history'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CropDiagnosticResult | null>(null);
  
  const [savedHistory, setSavedHistory] = useState<SavedDiagnostic[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SavedDiagnostic | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraActive, facingMode]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        toast.error("Camera access not supported on this browser.");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera. Please allow camera permissions or upload an image.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        setIsCameraActive(false);
        toast.success("Photo captured! Ready for AI diagnosis.");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size too large. Please select an image under 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        setIsCameraActive(false);
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeProduce = async () => {
    if (!capturedImage) {
      toast.error("Please take a photo or select an image first.");
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: capturedImage,
          mimeType: 'image/jpeg',
          cropType,
          notes
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze crop image");
      }

      const diagnosticData: CropDiagnosticResult = await res.json();
      setResult(diagnosticData);
      toast.success("AI Crop Diagnosis Complete!");

      // Save to Firestore if user logged in
      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'cropDiagnostics'), {
            sellerId: auth.currentUser.uid,
            imageUrl: capturedImage,
            cropName: diagnosticData.cropName,
            overallHealth: diagnosticData.overallHealth,
            healthScore: diagnosticData.healthScore,
            qualityGrade: diagnosticData.qualityGrade,
            diagnosedIssues: diagnosticData.diagnosedIssues,
            mitigationStrategies: diagnosticData.mitigationStrategies,
            marketabilityInsight: diagnosticData.marketabilityInsight,
            preventativeAdvice: diagnosticData.preventativeAdvice,
            createdAt: new Date().toISOString(),
            notes: notes || undefined
          });
        } catch (fErr) {
          console.error("Error saving diagnostic to Firestore:", fErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to run AI crop diagnosis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'cropDiagnostics'),
        where('sellerId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedDiagnostic));
      setSavedHistory(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteDiagnostic = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cropDiagnostics', id));
      setSavedHistory(prev => prev.filter(item => item.id !== id));
      if (selectedHistoryItem?.id === id) setSelectedHistoryItem(null);
      toast.success("Diagnostic record removed.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record.");
    }
  };

  const loadPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setCapturedImage(preset.image);
    setCropType(preset.crop);
    setNotes(preset.notes);
    setIsCameraActive(false);
    setResult(null);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const getHealthBadgeStyle = (health: string) => {
    switch (health) {
      case 'Healthy':
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'Mild Issues Detected':
        return "bg-amber-50 text-amber-700 border-amber-200";
      case 'Moderate Disease / Infection':
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Banner */}
      <div className="bg-stone-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest rounded-full">
                AI Phytopathologist & Agronomist
              </span>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                Camera-Integrated Diagnostic Engine
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif italic font-medium leading-tight">
              Crop Health & Disease Diagnostic Doctor
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              Snap produce or crop leaf photos directly using your camera. Our neural model identifies fungal infections, pest infestations, nutrient deficiencies, and provides actionable treatment protocols.
            </p>
          </div>

          <div className="flex bg-stone-800/80 p-1.5 rounded-2xl border border-stone-700/60 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('camera')}
              className={cn(
                "flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === 'camera' 
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30" 
                  : "text-stone-400 hover:text-white"
              )}
            >
              <Camera size={16} />
              Diagnose
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === 'history' 
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30" 
                  : "text-stone-400 hover:text-white"
              )}
            >
              <History size={16} />
              Scan Log ({savedHistory.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'camera' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Camera / Upload Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 border border-stone-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Camera size={18} className="text-brand-600" />
                  Produce Photo Capture
                </h3>
                {capturedImage && (
                  <button 
                    onClick={() => { setCapturedImage(null); setResult(null); }} 
                    className="text-xs font-bold text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1"
                  >
                    <RotateCw size={12} /> Reset
                  </button>
                )}
              </div>

              {/* Viewport Box */}
              <div className="relative aspect-square rounded-[2rem] bg-stone-950 overflow-hidden border-2 border-stone-200 flex flex-col items-center justify-center group shadow-inner">
                {isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover" 
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Camera Overlay Guide */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-emerald-400/50 rounded-[2rem] m-6 flex items-center justify-center">
                      <div className="text-center bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] text-white font-bold uppercase tracking-widest">
                        Center affected produce or leaves in frame
                      </div>
                    </div>

                    {/* Camera Controls */}
                    <div className="absolute bottom-4 inset-x-4 flex items-center justify-between px-4 z-20">
                      <button 
                        onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                        className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black transition-all"
                        title="Switch Camera"
                      >
                        <RotateCw size={18} />
                      </button>

                      <button 
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <Camera size={24} />
                        </div>
                      </button>

                      <button 
                        onClick={() => setIsCameraActive(false)}
                        className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : capturedImage ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={capturedImage} 
                      alt="Captured produce" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      Image Ready
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-stone-900 text-brand-400 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                      <Leaf size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">No Produce Image Loaded</p>
                      <p className="text-xs text-stone-400 max-w-xs mx-auto">
                        Turn on live camera stream or upload a photo from your gallery to begin diagnosis.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setIsCameraActive(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-600/30"
                      >
                        <Camera size={16} />
                        Open Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                      >
                        <Upload size={16} />
                        Upload File
                      </button>
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Crop Form details */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5 block">
                    Produce Category (Optional Hint)
                  </label>
                  <input 
                    type="text"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    placeholder="e.g. Tomato, Bell Pepper, Grape, Strawberry..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 text-xs font-bold text-stone-900 outline-none focus:border-brand-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5 block">
                    Visual Observations & Farmer Notes
                  </label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Dark concentric spots on leaves, wilting stem, yellow spots..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 text-xs font-medium text-stone-900 outline-none focus:border-brand-600 transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={analyzeProduce}
                  disabled={analyzing || !capturedImage}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl",
                    capturedImage && !analyzing
                      ? "bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/20 hover:scale-[1.01]"
                      : "bg-stone-100 text-stone-400 cursor-not-allowed"
                  )}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="animate-spin text-brand-400" size={16} />
                      AI Analyzing Produce Pathogens...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-brand-400" />
                      Run AI Crop Diagnosis
                    </>
                  )}
                </button>
              </div>

              {/* Presets Bar */}
              <div className="pt-4 border-t border-stone-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-3">
                  Quick Demo Sample Presets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadPreset(preset)}
                      className="p-2.5 bg-stone-50 hover:bg-brand-50 border border-stone-200/60 rounded-xl text-left transition-all flex items-center gap-2 group"
                    >
                      <img src={preset.image} alt={preset.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-stone-800 truncate group-hover:text-brand-700">{preset.name}</p>
                        <p className="text-[9px] text-stone-400 truncate">{preset.crop}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis Results */}
          <div className="lg:col-span-7 space-y-6">
            {analyzing ? (
              <div className="bg-white rounded-[2.5rem] p-12 border border-stone-200/80 shadow-sm text-center min-h-[500px] flex flex-col items-center justify-center space-y-6">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-100 animate-ping" />
                  <div className="w-24 h-24 bg-brand-50 rounded-full border-4 border-brand-500 flex items-center justify-center text-brand-600 animate-spin">
                    <RefreshCw size={36} />
                  </div>
                </div>
                <div className="space-y-2 max-w-sm">
                  <h4 className="text-xl font-serif italic font-bold text-stone-900">Scanning Produce Image</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Analyzing leaf chlorosis, necrosis patterns, fungal spore geometry, and quality defects against global phytopathology benchmarks...
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200/80 shadow-sm space-y-8 animate-in fade-in duration-500">
                {/* Health Score Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        getHealthBadgeStyle(result.overallHealth)
                      )}>
                        {result.overallHealth}
                      </span>
                      <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-stone-200">
                        {result.qualityGrade}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif italic font-bold text-stone-900">
                      {result.cropName} Health Diagnostic
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 bg-stone-50 px-6 py-4 rounded-2xl border border-stone-200/60">
                    <div className="text-right">
                      <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">Health Index</span>
                      <span className="text-3xl font-black text-stone-900">{result.healthScore}<span className="text-stone-400 text-lg">/100</span></span>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                      result.healthScore > 80 ? "bg-emerald-100 text-emerald-700" :
                      result.healthScore > 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    )}>
                      {result.healthScore > 80 ? 'A+' : result.healthScore > 50 ? 'B' : 'C'}
                    </div>
                  </div>
                </div>

                {/* Detected Issues */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Bug size={14} className="text-brand-600" />
                    Identified Diseases & Quality Issues ({result.diagnosedIssues.length})
                  </h4>

                  {result.diagnosedIssues.length === 0 ? (
                    <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                      No active pathogens, diseases, or severe quality defects detected in this produce sample.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.diagnosedIssues.map((issue, idx) => (
                        <div key={idx} className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-stone-900">{issue.issueName}</h5>
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-stone-200 text-stone-700 rounded-md">
                                  {issue.category}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                                {issue.visualSymptoms}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full block mb-1",
                                issue.severity === 'Critical' || issue.severity === 'High' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {issue.severity} Severity
                              </span>
                              <span className="text-[10px] text-stone-400 font-bold">
                                {issue.confidence}% Confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actionable Mitigation Protocols */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-brand-600" />
                    Actionable Farmer Mitigation Strategies
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.mitigationStrategies.map((strat, idx) => (
                      <div key={idx} className="p-5 bg-stone-900 text-white rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-brand-400 px-2 py-0.5 bg-white/10 rounded-md">
                            {strat.type}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white">{strat.title}</h5>
                        <p className="text-xs text-stone-300 leading-relaxed font-normal">
                          {strat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketability & Preventative Advice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <h5 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <Award size={14} className="text-amber-600" />
                      Marketability & Harvest Strategy
                    </h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {result.marketabilityInsight}
                    </p>
                  </div>

                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                    <h5 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <Droplets size={14} className="text-blue-600" />
                      Long-Term Farm Prevention
                    </h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {result.preventativeAdvice}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span>Logged in Farm Diagnostic Records</span>
                  <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-1.5 font-bold text-stone-700 hover:text-stone-900"
                  >
                    <Printer size={14} /> Print Diagnostic Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 rounded-[2.5rem] p-12 border-2 border-dashed border-stone-200 text-center min-h-[500px] flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-3xl border border-stone-200 flex items-center justify-center text-stone-300 shadow-sm">
                  <Activity size={32} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-stone-800">Awaiting Produce Photo</h4>
                  <p className="text-xs text-stone-400">
                    Capture or upload a crop photo on the left panel to display real-time disease diagnostic, severity index, and treatment strategies.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Farm Scan History</h3>
              <p className="text-xs text-stone-400">Saved produce health scans and mitigation records</p>
            </div>
            <button 
              onClick={fetchHistory}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-stone-400 text-xs">Loading historical diagnostics...</div>
          ) : savedHistory.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs space-y-2">
              <FileText size={32} className="mx-auto text-stone-300" />
              <p>No saved diagnostic scans yet. Run a crop diagnosis above to populate your farm history.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedHistory.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-stone-900">
                    <img src={item.imageUrl} alt={item.cropName} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                      Score: {item.healthScore}/100
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-stone-900">{item.cropName}</h4>
                        <span className="text-[9px] font-black text-stone-400 uppercase">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mb-2 border",
                        getHealthBadgeStyle(item.overallHealth)
                      )}>
                        {item.overallHealth}
                      </span>
                      <p className="text-xs text-stone-600 line-clamp-2 font-medium">
                        {item.diagnosedIssues.map(i => i.issueName).join(', ') || 'No major issues'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-200/60">
                      <button
                        onClick={() => setSelectedHistoryItem(item)}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        View Full Report <ChevronRight size={14} />
                      </button>

                      <button
                        onClick={() => deleteDiagnostic(item.id)}
                        className="text-stone-300 hover:text-red-600 text-xs font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History Detail Modal */}
          {selectedHistoryItem && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h3 className="text-lg font-serif italic font-bold text-stone-900">
                    Saved Diagnostic: {selectedHistoryItem.cropName}
                  </h3>
                  <button onClick={() => setSelectedHistoryItem(null)} className="p-2 text-stone-400 hover:text-stone-900">
                    <X size={20} />
                  </button>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden bg-stone-900">
                  <img src={selectedHistoryItem.imageUrl} alt={selectedHistoryItem.cropName} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border", getHealthBadgeStyle(selectedHistoryItem.overallHealth))}>
                      {selectedHistoryItem.overallHealth}
                    </span>
                    <span className="text-xs font-bold text-stone-500">
                      Grade: {selectedHistoryItem.qualityGrade}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-stone-400">Issues</h4>
                    {selectedHistoryItem.diagnosedIssues.map((iss, i) => (
                      <div key={i} className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-stone-900">{iss.issueName} ({iss.severity} Severity)</div>
                        <div className="text-stone-600">{iss.visualSymptoms}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-stone-400">Mitigation Steps</h4>
                    {selectedHistoryItem.mitigationStrategies.map((ms, i) => (
                      <div key={i} className="p-3 bg-stone-900 text-white rounded-xl text-xs space-y-1">
                        <div className="font-bold text-brand-400">{ms.title} ({ms.type})</div>
                        <div className="text-stone-300">{ms.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedHistoryItem(null)}
                  className="w-full py-3 bg-stone-100 font-black text-xs uppercase tracking-widest text-stone-700 rounded-xl hover:bg-stone-200"
                >
                  Close Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
