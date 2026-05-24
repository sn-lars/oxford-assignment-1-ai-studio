import React, { useState, useEffect } from "react";
import { 
  BriefingData, 
  BriefingFile, 
  BriefingPackage 
} from "./types";
import { PRELOADED_PACKAGES } from "./scenarios";
import { 
  FileText, 
  UploadCloud, 
  History, 
  Trash2, 
  Bolt, 
  HelpCircle, 
  Archive, 
  Activity, 
  Users, 
  Calendar as CalendarIcon, 
  FileCode, 
  AlertTriangle, 
  CheckSquare, 
  Compass, 
  ChevronRight, 
  Info, 
  Menu, 
  Check, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Plus,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation: "Briefings" (Intake Screen) or "Dashboard" (Results Screen)
  const [activeScreen, setActiveScreen] = useState<"briefings" | "dashboard">("briefings");
  
  // Sidebar Sub-tab within Dashboard
  const [activeDashboardTab, setActiveDashboardTab] = useState<"agenda" | "bios" | "history" | "metrics" | "actions">("agenda");

  // Selected Executive Preloaded Package
  const [selectedPackage, setSelectedPackage] = useState<BriefingPackage>(PRELOADED_PACKAGES[0]);
  
  // Active text in Notes textarea
  const [executiveNotes, setExecutiveNotes] = useState<string>(PRELOADED_PACKAGES[0].notes);
  
  // Real file manager state (starts empty because design examples are removed)
  const [filesList, setFilesList] = useState<BriefingFile[]>([]);
  
  // Full processed briefing data state
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  
  // App-level server connection status checking state
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  
  // Loading and error states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Checked items state inside check lists
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  
  // Custom inspect file content modal
  const [inspectingFile, setInspectingFile] = useState<BriefingFile | null>(null);

  // New action item state
  const [customActionText, setCustomActionText] = useState<string>("");

  // Real file uploading state references
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Check config status from API on mount
  useEffect(() => {
    fetch("/api/config-status")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.warn("Could not retrieve API config status:", err);
      });
  }, []);

  // When package selection is changed, auto-reload notes only, leaving file uploader empty ("static examples for now")
  const handleSelectPackage = (pkg: BriefingPackage) => {
    setSelectedPackage(pkg);
    setExecutiveNotes(pkg.notes);
    setFilesList([]);
    setCompletedActions({});
  };

  // Real Upload handling using Express server backend text extraction
  const handleUploadFile = async (file: File) => {
    const acceptedExtensions = [".pdf", ".docx", ".doc", ".pptx"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!acceptedExtensions.includes(ext)) {
      setFileUploadError(`Unsupported format '${ext}'. We only accept PDF, PPTX, and MS Word (.docx, .doc) files.`);
      return;
    }

    setIsUploadingFile(true);
    setFileUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-extract", {
        method: "POST",
        body: formData,
      });

      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Non-JSON upload-extract API response received:", rawText);
        let errorMsg = `Server returned an invalid response format (Status: ${response.status})`;
        if (rawText.trim().toLowerCase().startsWith("<!doctype") || rawText.trim().toLowerCase().startsWith("<html")) {
          errorMsg = `The server returned an HTML document (Status: ${response.status}) instead of JSON. This typically occurs during system-level redirects, resource constraints, or unexpected server reloads. Please verify your platform's server logs.`;
        } else if (rawText && rawText.trim().length > 0) {
          errorMsg = rawText.length > 150 ? rawText.substring(0, 150) + "..." : rawText;
        }
        throw new Error(errorMsg);
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to extract content (Status: ${response.status})`);
      }
      
      const newFileObj: BriefingFile = {
        id: "file-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        name: data.name,
        size: data.size,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.content,
        status: data.status || "Processed"
      };

      setFilesList((prev) => [...prev, newFileObj]);
    } catch (err: any) {
      console.error("File upload extraction failed:", err);
      setFileUploadError(err.message || "An unresolved error occurred while extracting raw text on the server.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  // Process Briefing Core Logic
  const handleProcessBriefing = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    setProcessingStatus("Initializing intelligence engine...");

    // Stagger statuses to simulate rich pipeline
    const statuses = [
      "Securing data grounding container...",
      "Extracting text from PDF & Slides...",
      "Executing discrepancy and contradiction checks...",
      "Grounding facts & filtering external hallucinations...",
      "Finalizing structured executive summary...",
    ];

    let statusIdx = 0;
    const interval = setInterval(() => {
      if (statusIdx < statuses.length) {
        setProcessingStatus(statuses[statusIdx]);
        statusIdx++;
      }
    }, 850);

    try {
      const response = await fetch("/api/process-briefing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: executiveNotes,
          files: filesList.map((f) => ({ name: f.name, content: f.content })),
        }),
      });

      clearInterval(interval);

      const rawText = await response.text();
      let data: BriefingData;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Non-JSON process-briefing API response received:", rawText);
        let errorMsg = `Server returned an invalid briefing response (Status: ${response.status})`;
        if (rawText.trim().toLowerCase().startsWith("<!doctype") || rawText.trim().toLowerCase().startsWith("<html")) {
          errorMsg = `Corporate Intelligence API failed with status ${response.status} (returned HTML instead of briefing analysis). This usually means a connection was reset or the container re-initialized.`;
        } else if (rawText && rawText.trim().length > 0) {
          errorMsg = rawText.length > 150 ? rawText.substring(0, 150) + "..." : rawText;
        }
        throw new Error(errorMsg);
      }

      if (!response.ok) {
        throw new Error((data as any).error || `Execution error (Status: ${response.status})`);
      }
      setBriefingData(data);
      
      // Seed default completed actions values
      const initialChecked: Record<string, boolean> = {};
      data.next_steps.forEach((step, idx) => {
        // default first one as checked for active aesthetic matching screenshot
        initialChecked[idx] = idx === 1;
      });
      setCompletedActions(initialChecked);

      setActiveDashboardTab("agenda");
      setActiveScreen("dashboard");
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setProcessingError(err.message || "Failed to parse structured documents.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete uploaded file item
  const handleDeleteFile = (id: string) => {
    setFilesList((prev) => prev.filter((f) => f.id !== id));
  };

  // Toggle checklist states
  const toggleActionItem = (idx: string | number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Add custom manual action items to processed state
  const handleAddCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionText.trim() || !briefingData) return;

    const updatedSteps = [...briefingData.next_steps, customActionText.trim()];
    setBriefingData({
      ...briefingData,
      next_steps: updatedSteps,
    });
    setCustomActionText("");
  };

  // Calculate stats
  const totalSteps = briefingData?.next_steps.length || 0;
  const completedStepsCount = Object.values(completedActions).filter(Boolean).length;
  const processedPercent = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-sans selection:bg-[#d5e3fd] selection:text-[#001a42]">
      
      {/* Dynamic API status warning alert when missing key */}
      {!hasApiKey && (
        <div className="bg-[#ffdad6] text-[#93000a] text-xs px-margin py-2 text-center font-medium flex items-center justify-center gap-2 border-b border-[#ffb3ab]" id="api-key-warning">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong>Simulated intelligence mode active:</strong> Provide your <strong>GEMINI_API_KEY</strong> in the <strong>Settings &gt; Secrets</strong> panel to enable live file analysis.
          </span>
        </div>
      )}

      {/* TopNavBar Header component */}
      <header className="bg-white border-b border-[#eceef0] flex justify-between items-center px-margin w-full h-16 sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveScreen("briefings")}>
            <div className="w-9 h-9 bg-[#131b2e] rounded flex items-center justify-center shadow-sm">
              <Layers className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-headline-md tracking-tight text-[#131b2e]">
              Executive Intelligence
            </span>
          </div>
          
          <nav className="hidden md:flex gap-6 h-full items-center">
            <button 
              onClick={() => {
                if (briefingData) {
                  setActiveScreen("dashboard");
                  setActiveDashboardTab("agenda");
                }
              }}
              disabled={!briefingData}
              className={`text-sm font-semibold transition-all h-16 px-2 flex items-center border-b-2 hover:text-[#131b2e] ${
                activeScreen === "dashboard" && activeDashboardTab !== "actions"
                  ? "border-[#131b2e] text-[#131b2e]" 
                  : "border-transparent text-[#515f74] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => {
                if (briefingData) {
                  setActiveScreen("dashboard");
                  setActiveDashboardTab("actions");
                }
              }}
              disabled={!briefingData}
              className={`text-sm font-semibold transition-all h-16 px-2 flex items-center border-b-2 hover:text-[#131b2e] ${
                activeScreen === "dashboard" && activeDashboardTab === "actions"
                  ? "border-[#131b2e] text-[#131b2e]" 
                  : "border-transparent text-[#515f74] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              Action Tracking
            </button>
            <button 
              onClick={() => setActiveScreen("briefings")}
              className={`text-sm font-semibold transition-all h-16 px-2 flex items-center border-b-2 hover:text-[#131b2e] ${
                activeScreen === "briefings"
                  ? "border-[#131b2e] text-[#131b2e]" 
                  : "border-transparent text-[#515f74]"
              }`}
            >
              Intake Hub
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative p-2 hover:bg-[#eceef0] rounded-full transition-colors cursor-pointer" title="Notifications">
            <Layers className="w-5 h-5 text-[#515f74]" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border-2 border-white"></span>
          </div>
          
          <button 
            className="p-2 hover:bg-[#eceef0] rounded-full transition-colors cursor-pointer text-[#515f74]" 
            title="Intake Setup Quick Link"
            onClick={() => setActiveScreen("briefings")}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#c6c6cd]">
            <img 
              alt="Executive Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHqX1zmWNoNwjcO0hllOg7tzMExbbDhsHRo8NwlXa2AhsnPktYztil51EpLj4NP59pd7k2U_wP-GftqTf8eJ3nOEqG2RZCjxoq7evEg-UtyTYVgS2uTMVEQsWiyv8avLK3BN46ij6pf5DjJTK25gAXnm7Adem67W4gNgZH6Ojjeh4z9i-sV8goEI1aINHL1u40MNoUYt0Fu8w6TRvWFN0lpJ7PBfJ3CJZsClMcRK5cjRaQva3mHQ2HwheOSkxfPOEgO2Xe7qD2cN4"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Primary Workspace Container */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)] relative">
        
        {/* Persistent Sidemenu displaying active scenario */}
        <aside className="w-64 bg-white border-r border-[#eceef0] hidden md:flex flex-col justify-between py-6">
          <div className="flex-1 flex flex-col">
            
            {/* Meta header displaying selected package status */}
            <div className="px-6 mb-6">
              <span className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider">Active Workspace</span>
              <div className="flex items-center gap-2.5 mt-2 bg-[#f2f4f6] p-2.5 rounded-lg border border-[#eceef0]">
                <div className="w-7 h-7 bg-[#dae2fd] rounded flex items-center justify-center text-[#131b2e]">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-[#191c1e] truncate">{selectedPackage.title}</h4>
                  <p className="text-[10px] text-[#515f74] truncate">{selectedPackage.time}</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (activeScreen === "dashboard") {
                    setActiveScreen("briefings");
                  } else {
                    handleProcessBriefing();
                  }
                }}
                disabled={isProcessing}
                className="mt-4 w-full bg-[#131b2e] hover:bg-black text-white py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : activeScreen === "briefings" ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#bec6e0]" />
                    <span>Generate Summary</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Modify Briefing</span>
                  </>
                )}
              </button>
            </div>

            {/* Sub navigation items */}
            {activeScreen === "dashboard" ? (
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveDashboardTab("agenda")}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-bold transition-all text-left border-r-4 ${
                    activeDashboardTab === "agenda"
                      ? "text-[#131b2e] border-[#131b2e] bg-[#dae2fd]/30"
                      : "text-[#515f74] border-transparent hover:bg-[#f2f4f6]"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Meeting Agenda</span>
                </button>
                <button
                  onClick={() => setActiveDashboardTab("bios")}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-bold transition-all text-left border-r-4 ${
                    activeDashboardTab === "bios"
                      ? "text-[#131b2e] border-[#131b2e] bg-[#dae2fd]/30"
                      : "text-[#515f74] border-transparent hover:bg-[#f2f4f6]"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Participant Bios</span>
                </button>
                <button
                  onClick={() => setActiveDashboardTab("history")}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-bold transition-all text-left border-r-4 ${
                    activeDashboardTab === "history"
                      ? "text-[#131b2e] border-[#131b2e] bg-[#dae2fd]/30"
                      : "text-[#515f74] border-transparent hover:bg-[#f2f4f6]"
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Historical Context</span>
                </button>
                <button
                  onClick={() => setActiveDashboardTab("metrics")}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-bold transition-all text-left border-r-4 ${
                    activeDashboardTab === "metrics"
                      ? "text-[#131b2e] border-[#131b2e] bg-[#dae2fd]/30"
                      : "text-[#515f74] border-transparent hover:bg-[#f2f4f6]"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Key Metrics</span>
                </button>
                <button
                  onClick={() => setActiveDashboardTab("actions")}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-bold transition-all text-left border-r-4 ${
                    activeDashboardTab === "actions"
                      ? "text-[#131b2e] border-[#131b2e] bg-[#dae2fd]/30"
                      : "text-[#515f74] border-transparent hover:bg-[#f2f4f6]"
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Action Items</span>
                </button>
              </nav>
            ) : (
              <div className="px-6 py-4 flex-1">
                <span className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider block mb-3">
                  Preloaded Templates
                </span>
                <div className="space-y-2">
                  {PRELOADED_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className={`w-full text-left p-3 rounded border text-xs transition-all ${
                        selectedPackage.id === pkg.id
                          ? "bg-[#dae2fd]/50 border-[#dae2fd] font-bold text-[#001a42]"
                          : "bg-transparent border-[#eceef0] text-[#515f74] hover:bg-[#f2f4f6] hover:border-[#c6c6cd]"
                      }`}
                    >
                      <div className="truncate font-semibold">{pkg.title}</div>
                      <div className="text-[10px] opacity-70 mt-0.5 truncate">{pkg.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Utility controls */}
          <div className="border-t border-[#eceef0] pt-4 space-y-1">
            <button
              onClick={() => {
                alert("Archive features are handled transparently. Historical sessions are synced to the local memory workspace.");
              }}
              className="w-full flex items-center gap-3 px-6 py-2.5 text-xs font-bold text-[#515f74] hover:bg-[#f2f4f6] text-left"
            >
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => {
                alert("Executive Intelligence Hub Support: Reach out in user dashboard settings for live SLA assistance.");
              }}
              className="w-full flex items-center gap-3 px-6 py-2.5 text-xs font-bold text-[#515f74] hover:bg-[#f2f4f6] text-left"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Display Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-[#f2f4f6]">
          
          <AnimatePresence mode="wait">
            {activeScreen === "briefings" ? (
              
              /* ==========================================
                 SCREEN 2: INTAKE BRIEFING DATA 
                 ========================================== */
              <motion.div
                key="briefings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="p-margin max-w-[1050px] mx-auto w-full space-y-8 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-8">
                  
                  {/* Title and Strategic Subheading */}
                  <div>
                    <h1 className="text-3xl font-bold font-headline-lg tracking-tight text-[#131b2e]">
                      Intake Briefing Data
                    </h1>
                    <p className="text-[#515f74] text-sm mt-1">
                      Provide organizational context, transcripts, and upload source materials to initialize your executive preparation alignment.
                    </p>
                  </div>

                  {/* High Intensity Bento Grid for Inputs */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Notes Area Card */}
                    <div className="lg:col-span-7 bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#131b2e]" />
                        <h2 className="text-lg font-bold font-headline-sm text-[#131b2e]">Executive Notes</h2>
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <textarea
                          value={executiveNotes}
                          onChange={(e) => setExecutiveNotes(e.target.value)}
                          placeholder="Enter strategic context, high-level meeting goals, or specific points of emphasis for the Intelligence Engine..."
                          className="w-full flex-grow h-48 bg-[#f2f4f6] border border-[#c6c6cd] p-4 text-sm rounded focus:ring-1 focus:ring-[#131b2e] focus:border-[#131b2e] outline-none transition-all resize-none font-sans"
                        />
                        <div className="mt-3 text-xs text-[#515f74] flex items-center gap-1.5 opacity-80">
                          <Info className="w-3.5 h-3.5 text-[#131b2e]" />
                          <span>Direct input helps calibrate the AI for your specific leadership style.</span>
                        </div>
                      </div>
                    </div>

                    {/* Real Drag & Drop Upload Zone Card */}
                    <div className="lg:col-span-5 bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm flex flex-col justify-between min-h-[280px]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <UploadCloud className="w-5 h-5 text-[#131b2e]" />
                          <h2 className="text-lg font-bold font-headline-sm text-[#131b2e]">Document Ingest</h2>
                        </div>
                        <span className="text-[9px] bg-[#d5e3fd] text-[#001a42] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          Auto Extraction
                        </span>
                      </div>

                      {/* Hidden browser file input */}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".pdf,.pptx,.docx,.doc" 
                        className="hidden" 
                      />

                      <div 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 border-2 border-dashed border-[#c6c6cd] hover:border-[#131b2e] rounded-lg flex flex-col items-center justify-center p-6 bg-[#f2f4f6]/60 hover:bg-[#f2f4f6] transition-all cursor-pointer group ${
                          isUploadingFile ? "pointer-events-none opacity-80" : ""
                        }`}
                      >
                        {isUploadingFile ? (
                          <div className="flex flex-col items-center justify-center text-center">
                            <RefreshCw className="w-8 h-8 text-[#131b2e] animate-spin mb-3" />
                            <p className="text-xs font-bold text-[#191c1e] mb-1">Processing uploaded file...</p>
                            <p className="text-[10px] text-[#515f74]">Extracting text data server-side</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-[#dae2fd]/40 group-hover:bg-[#dae2fd]/70 rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-all text-[#131b2e]">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-[#191c1e] mb-1">
                              Drag &amp; drop document, or <span className="text-[#004395] group-hover:underline">browse files</span>
                            </p>
                            <p className="text-[10px] text-[#515f74] max-w-xs mt-1 leading-relaxed">
                              Supports PDF, PPTX and MS Word files (Max 15MB)
                            </p>
                          </div>
                        )}
                      </div>

                      {fileUploadError && (
                        <div className="mt-3 p-2.5 bg-[#ffdad6] border border-[#ffb3ab] text-[#93000a] text-[11px] rounded flex items-start gap-1.5 leading-snug">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span>{fileUploadError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recently Uploaded Documents section */}
                  <div className="bg-white border border-[#eceef0] p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-[#131b2e]" />
                        <h2 className="text-lg font-bold font-headline-sm text-[#131b2e]">Recently Uploaded</h2>
                      </div>
                      
                      <button 
                        onClick={() => setFilesList([])}
                        className="text-xs font-bold text-[#515f74] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                        disabled={filesList.length === 0}
                      >
                        Clear All
                      </button>
                    </div>

                    {filesList.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#515f74] italic bg-[#f7f9fb] border border-[#eceef0] rounded">
                        No files currently uploaded. Add custom documents or select a template to load.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filesList.map((file) => (
                          <div 
                            key={file.id} 
                            className="flex items-center justify-between p-3 border border-[#eceef0] hover:bg-[#f2f4f6]/50 transition-all rounded cursor-pointer"
                            onClick={() => setInspectingFile(file)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 ${
                                file.name.endsWith(".pdf") ? "bg-[#ffdad6] text-[#93000a]" : "bg-[#d5e3fd] text-[#0d1c2f]"
                              } flex items-center justify-center rounded transition-all`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#191c1e]">{file.name}</p>
                                <p className="text-[10px] text-[#515f74]">{file.size} • Uploaded recently</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                              <span className="px-2.5 py-0.5 bg-[#eceef0] text-[#45464d] text-[10px] font-bold rounded-full">
                                {file.status}
                              </span>
                              <button 
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-1 hover:bg-[#ffdad6] hover:text-[#93000a] text-[#515f74] rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {processingError && (
                    <div className="p-4 bg-[#ffdad6] border border-[#ffb3ab] text-[#93000a] text-sm rounded flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Processing Failed:</strong> {processingError}
                        <p className="text-xs mt-1">Please clarify your executive notes or cross-check file inputs.</p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Intake Page footer processing triggers */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#eceef0] mt-8">
                  <button 
                    onClick={() => {
                      if (briefingData) {
                        setActiveScreen("dashboard");
                      } else {
                        alert("No existing dashboard data is active. Please select a template or click 'Process Briefing' first.");
                      }
                    }}
                    className="px-5 py-2 border border-[#c6c6cd] text-[#515f74] text-xs font-bold rounded hover:bg-[#eceef0] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleProcessBriefing}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-[#131b2e] hover:bg-black text-white text-xs font-bold rounded shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{processingStatus}</span>
                      </>
                    ) : (
                      <>
                        <span>Process Briefing</span>
                        <Bolt className="w-4 h-4 text-[#dae2fd]" />
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            ) : (
              
              /* ==========================================
                 SCREEN 1: THE ACTIVE EXECUTIVE DASHBOARD
                 ========================================== */
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col flex-grow"
              >
                
                {/* Immersive Cover Hero Area component */}
                <section className="relative w-full h-[180px] md:h-[240px] overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-[#131b2e]/60 z-10"></div>
                  <img 
                    alt="Professional Executive Boardroom" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq11mRLkfrO_GwQxXl8FsrFcA5nGkJzrqWbDhy5e4fA0f0d_bMNlf9IvvVeIrXkY3sDd2Em_bi-g5G1VU0pKeqPUV2Df87Ax2iZ1SmLsVpHoB8lO8ix_k3OAIC0avBatND4knahkkKgrd9FRWO5L_oq-AO3-duAl-ooMDz3Vg2gh1M2jdpADVLaodajrTnmXis16N4iy3RGvdVNsdnsdrZdfx0_KepbXkwEkbFRA42fzqmv_-SOAUi0_AlADa8KPsBBcRn8bJ89zs" 
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-margin pb-6 max-w-[#1100px] mx-auto w-full">
                    <span className="text-[10px] uppercase font-bold text-white/80 tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full w-fit mb-2">
                       Confidential Advisory Briefing
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline-lg text-white mb-1">
                      {selectedPackage.title} & Alignment
                    </h1>
                    <p className="text-xs text-white/70 italic max-w-lg">
                      Visual theme generated from prompt: "{briefingData?.cover_image_prompt || "Minimalist board skyline"}"
                    </p>
                  </div>
                </section>

                {/* Meeting Dashboard views dispatcher */}
                <div className="p-margin max-w-[#1100px] mx-auto w-full space-y-6 flex-grow pb-12">
                  
                  {/* Small Breadcrumbs to swap view tabs dynamically on mobile screens */}
                  <div className="md:hidden flex overflow-x-auto gap-2 py-2 border-b border-[#c6c6cd]">
                    {[
                      { id: "agenda", label: "Agenda" },
                      { id: "bios", label: "Attendees" },
                      { id: "history", label: "History" },
                      { id: "metrics", label: "Metrics" },
                      { id: "actions", label: "Actions" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setActiveDashboardTab(btn.id as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                          activeDashboardTab === btn.id
                            ? "bg-[#131b2e] text-white"
                            : "bg-[#eceef0] text-[#515f74]"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* TAB DISPATCHER VIEW */}
                  {briefingData && (
                    <AnimatePresence mode="wait">
                      {activeDashboardTab === "agenda" && (
                        
                        /* ================================
                           TAB: MEETING AGENDA
                           ================================ */
                        <motion.div
                          key="agenda-tab"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                        >
                          {/* Left Panel: Executive Summary & Discovered Risks */}
                          <div className="lg:col-span-8 space-y-6">
                            
                            {/* Executive Summary Section */}
                            <div className="bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm">
                              <div className="flex justify-between items-center mb-4 border-b border-[#eceef0] pb-2">
                                <h3 className="text-base font-bold text-[#131b2e]">Executive Summary</h3>
                                <span className="text-[10px] bg-[#d5e3fd] text-[#0d1c2f] px-2 py-0.5 rounded-full font-bold">Grounded</span>
                              </div>
                              <p className="text-sm text-[#191c1e] leading-relaxed">
                                {briefingData.meeting_summary}
                              </p>
                            </div>

                            {/* Key Risks & Discrepancy detector Section */}
                            <div className="bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm">
                              <div className="flex justify-between items-center mb-4 border-b border-[#eceef0] pb-2">
                                <h3 className="text-base font-bold text-[#131b2e]">Key Risks & Discrepancies</h3>
                                <span className="text-[10px] bg-[#ffdad6] text-[#93000a] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Conflict Audit</span>
                                </span>
                              </div>
                              
                              <p className="text-xs text-[#515f74] mb-3 leading-normal">
                                Our Assistant Intelligence Engine has parsed and cross-checked files for factual variance. Any contradictions between source documents are highlighted below.
                              </p>

                              <div className="space-y-3.5">
                                {briefingData.risks.map((risk, index) => {
                                  const isConflict = risk.toLowerCase().includes("conflict") || risk.toLowerCase().includes("discrepancy");
                                  return (
                                    <div 
                                      key={index} 
                                      className={`p-3.5 rounded flex items-start gap-3 border ${
                                        isConflict 
                                          ? "bg-[#ffdad6]/40 border-[#ffb3ab] text-[#191c1e]" 
                                          : "bg-[#f2f4f6] border-[#eceef0] text-[#191c1e]"
                                      }`}
                                    >
                                      <div className={`w-2 h-2 rounded-sm mt-1.5 flex-shrink-0 ${
                                        isConflict ? "bg-[#ba1a1a]" : "bg-[#515f74]"
                                      }`}></div>
                                      
                                      <div className="flex-grow">
                                        <p className="text-xs leading-relaxed font-semibold">
                                          {risk}
                                        </p>
                                        <div className="mt-1.5 flex items-center justify-between">
                                          <span className="text-[9px] font-bold text-[#45464d] uppercase tracking-wider bg-white/60 px-2 py-0.5 rounded border border-[#eceef0]">
                                            SOURCE: {risk.toUpperCase().includes("LOGISTICS") ? "[Logistics Report Disagreement]" : "[Verified Audit Document]"}
                                          </span>
                                          <span className="text-[9px] text-[#515f74] italic">Requires Resolution</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>

                          {/* Right Panel: Talking Points & General Action Checklist */}
                          <div className="lg:col-span-4 space-y-6">
                            
                            {/* Talking Points section */}
                            <div className="bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm">
                              <h3 className="text-base font-bold text-[#131b2e] mb-4 border-b border-[#eceef0] pb-2">Talking Points</h3>
                              
                              <div className="space-y-4">
                                {briefingData.key_talking_points.map((pt, idx) => (
                                  <div key={idx} className="flex gap-3 group">
                                    <span className="text-[11px] font-bold text-[#004395] bg-[#d8e2ff] px-2 py-0.5 rounded h-fit">
                                      {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    <div>
                                      <p className="text-xs font-bold text-[#191c1e] leading-snug">
                                        {pt.split(":")[0]}
                                      </p>
                                      {pt.split(":")[1] && (
                                        <p className="text-[11px] text-[#515f74] mt-0.5 leading-normal">
                                          {pt.split(":")[1].trim()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Checklist widget */}
                            <div className="bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm">
                              <div className="flex items-center justify-between mb-3 border-b border-[#eceef0] pb-2">
                                <h3 className="text-base font-bold text-[#131b2e]">Quick Checklist</h3>
                                <span className="text-[10px] text-[#515f74] font-medium">{processedPercent}% Done</span>
                              </div>

                              <div className="space-y-3">
                                {briefingData.next_steps.slice(0, 5).map((step, idx) => (
                                  <label 
                                    key={idx} 
                                    className="flex items-start gap-2.5 cursor-pointer group"
                                  >
                                    <div className="relative flex items-center mt-0.5">
                                      <input 
                                        type="checkbox" 
                                        checked={!!completedActions[idx]}
                                        onChange={() => toggleActionItem(idx)}
                                        className="peer h-4 w-4 border border-[#c6c6cd] rounded bg-transparent checked:bg-[#131b2e] checked:border-[#131b2e] focus:ring-0 appearance-none transition-all cursor-pointer"
                                      />
                                      <Check className="absolute text-white w-3 h-3 opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none stroke-[3]" />
                                    </div>
                                    <span className={`text-xs leading-normal transition-all ${
                                      completedActions[idx] 
                                        ? "text-[#515f74] line-through decoration-1" 
                                        : "text-[#191c1e] group-hover:text-black font-medium"
                                    }`}>
                                      {step}
                                    </span>
                                  </label>
                                ))}
                              </div>

                              <button 
                                onClick={() => setActiveDashboardTab("actions")}
                                className="mt-4 w-full text-center text-[10px] font-bold text-[#131b2e] hover:underline flex items-center justify-center gap-1"
                              >
                                <span>Track Custom Actions</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      )}

                      {activeDashboardTab === "bios" && (
                        
                        /* ================================
                           TAB: PARTICIPANT BIOS
                           ================================ */
                        <motion.div
                          key="bios-tab"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-6"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-bold text-[#131b2e]">Participant Briefing & Profiles</h3>
                              <p className="text-[#515f74] text-xs">Aide context compiled on scheduled executive meeting attendees.</p>
                            </div>
                            <span className="text-[10px] bg-[#dae2fd] text-[#001a42] px-2 py-0.5 rounded font-bold">
                              {briefingData.participant_bios.length} Attendees
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {briefingData.participant_bios.map((bio, idx) => (
                              <div key={idx} className="bg-white border border-[#eceef0] rounded-lg shadow-sm flex flex-col justify-between">
                                <div className="p-5">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-[#f2f4f6] text-[#131b2e] flex items-center justify-center rounded-full font-bold text-sm tracking-tight border border-[#eceef0]">
                                      {bio.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-[#191c1e]">{bio.name}</h4>
                                      <p className="text-[10px] text-[#515f74] font-medium uppercase tracking-wider">{bio.role}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-[9px] font-bold text-[#515f74] uppercase tracking-wide block">Background</span>
                                      <p className="text-xs text-[#191c1e] leading-relaxed mt-0.5">
                                        {bio.background}
                                      </p>
                                    </div>
                                    
                                    <div className="bg-[#dae2fd]/20 p-3 rounded border border-[#dae2fd]/30">
                                      <span className="text-[9px] font-bold text-[#004395] uppercase tracking-wide block">PROACTIVE ADVICE</span>
                                      <p className="text-xs text-[#001a42] leading-relaxed mt-1 font-medium italic">
                                        "{bio.strategic_guidance}"
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-[#f2f4f6] px-5 py-2.5- border-t border-[#eceef0] text-center rounded-b py-2 text-[9px] text-[#515f74]">
                                   Inferred Alignment Strategy via Documents
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeDashboardTab === "history" && (
                        
                        /* ================================
                           TAB: HISTORICAL CONTEXT
                           ================================ */
                        <motion.div
                          key="history-tab"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm space-y-4"
                        >
                          <div className="flex justify-between items-center border-b border-[#eceef0] pb-2">
                            <div>
                              <h3 className="text-base font-bold text-[#131b2e]">Session Background & History</h3>
                              <p className="text-[10px] text-[#515f74]">Strategic context synthesized from your custom notes and historical tracking files.</p>
                            </div>
                            <History className="w-5 h-5 text-[#131b2e]" />
                          </div>

                          <div className="prose prose-sm max-w-none text-[#191c1e] leading-relaxed space-y-4 text-sm">
                            <p>
                              {briefingData.historical_context}
                            </p>
                            
                            <hr className="border-[#eceef0] my-4" />

                            <h4 className="font-bold text-xs text-[#131b2e] uppercase tracking-wider">Factual Audit Grounding Matrix</h4>
                            <p className="text-xs text-[#515f74]">
                              All statistics, statements, and operational targets shown are backed explicitly by the following reviewed corporate assets:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                              {filesList.map((file) => (
                                <div key={file.id} className="p-2.5 bg-[#f2f4f6] border border-[#eceef0] rounded flex items-center gap-2">
                                  <FileCode className="w-4 h-4 text-[#131b2e] flex-shrink-0" />
                                  <div className="truncate text-xs">
                                    <div className="font-bold text-[#191c1e] truncate">{file.name}</div>
                                    <div className="text-[10px] text-[#515f74]">{file.size} • Factual reference</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeDashboardTab === "metrics" && (
                        
                        /* ================================
                           TAB: KEY METRICS
                           ================================ */
                        <motion.div
                          key="metrics-tab"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-6"
                        >
                          <div>
                            <h3 className="text-lg font-bold text-[#131b2e]">Grounded Financial & Performance Metrics</h3>
                            <p className="text-[#515f74] text-xs">Quantitative metrics extracted explicitly from the uploaded materials with strict source verification.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {briefingData.key_metrics.map((m, idx) => (
                              <div key={idx} className="bg-white p-5 border border-[#eceef0] rounded-lg shadow-sm flex flex-col justify-between hover:border-[#131b2e] transition-colors">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-[#515f74] uppercase tracking-wider block max-w-[200px] truncate">{m.metric}</span>
                                    <span className="text-[9px] bg-[#dae2fd] text-[#001a42] font-bold px-2 py-0.5 rounded uppercase">{m.value.includes("%") ? "Ratio" : "Limit"}</span>
                                  </div>
                                  <div className="text-3xl font-extrabold text-[#111]">{m.value}</div>
                                  <p className="text-xs text-[#191c1e] leading-relaxed">
                                    {m.context}
                                  </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-[#eceef0] flex items-center justify-between text-[10px] text-[#515f74] italic">
                                  <span>Source: {m.source}</span>
                                  <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeDashboardTab === "actions" && (
                        
                        /* ================================
                           TAB: ACTION ITEMS TRACKER
                           ================================ */
                        <motion.div
                          key="actions-tab"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                        >
                          
                          {/* Left Panel - Checklist management */}
                          <div className="lg:col-span-8 bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm space-y-6">
                            <div className="flex justify-between items-center border-b border-[#eceef0] pb-2">
                              <div>
                                <h3 className="text-base font-bold text-[#131b2e]">Tactical Tasks & Checklist</h3>
                                <p className="text-[10px] text-[#515f74]">Execute alignment on deliverables derived directly from notes and slides.</p>
                              </div>
                              <span className="text-xs font-bold text-[#131b2e] bg-[#dae2fd] px-2.5 py-1 rounded">
                                {completedStepsCount} of {totalSteps} Completed
                              </span>
                            </div>

                            {/* Custom Task Adder */}
                            <form onSubmit={handleAddCustomAction} className="flex gap-2">
                              <input 
                                type="text" 
                                value={customActionText}
                                onChange={(e) => setCustomActionText(e.target.value)}
                                placeholder="Add custom tactical action for the meeting..."
                                className="flex-1 bg-[#f2f4f6] border border-[#c6c6cd] py-2 px-3 text-xs rounded outline-none focus:ring-1 focus:ring-[#131b2e] focus:border-[#131b2e] transition-all"
                              />
                              <button 
                                type="submit"
                                className="bg-[#131b2e] hover:bg-black text-white text-xs font-bold py-2 px-4 rounded flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            </form>

                            {/* Checklist */}
                            <div className="space-y-3 pt-2">
                              {briefingData.next_steps.map((step, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => toggleActionItem(idx)}
                                  className="flex items-start justify-between p-3 border border-[#eceef0] hover:bg-[#f2f4f6]/50 transition-all rounded cursor-pointer"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="relative flex items-center mt-0.5" onClick={(e) => e.stopPropagation()}>
                                      <input 
                                        type="checkbox" 
                                        checked={!!completedActions[idx]}
                                        onChange={() => toggleActionItem(idx)}
                                        className="peer h-4.5 w-4.5 border-2 border-[#c6c6cd] rounded bg-transparent checked:bg-[#131b2e] checked:border-[#131b2e] focus:ring-0 appearance-none transition-all cursor-pointer"
                                      />
                                      <Check className="absolute text-white w-3 h-3 opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none stroke-[3]" />
                                    </div>
                                    <span className={`text-xs leading-relaxed transition-all ${
                                      completedActions[idx] 
                                        ? "text-[#515f74] line-through decoration-1" 
                                        : "text-[#191c1e] font-medium"
                                    }`}>
                                      {step}
                                    </span>
                                  </div>

                                  <span className="text-[9px] bg-[#f2f4f6] text-[#45464d] px-2 py-0.5 rounded font-bold uppercase block tracking-wider">
                                    Tactical
                                  </span>
                                </div>
                              ))}
                            </div>

                          </div>

                          {/* Right Panel - Percent progress tracking graph */}
                          <div className="lg:col-span-4 bg-white p-6 border border-[#eceef0] rounded-lg shadow-sm space-y-6 flex flex-col justify-between">
                            <div className="space-y-4">
                              <h3 className="text-base font-bold text-[#131b2e] border-b border-[#eceef0] pb-2">Preparation Readiness</h3>
                              
                              {/* Circle loader tracker */}
                              <div className="flex flex-col items-center py-6">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                  {/* Custom dynamic visual layout loader */}
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="54" stroke="#eceef0" strokeWidth="8" fill="transparent" />
                                    <circle 
                                      cx="64" 
                                      cy="64" 
                                      r="54" 
                                      stroke="#131b2e" 
                                      strokeWidth="8" 
                                      fill="transparent" 
                                      strokeDasharray={2 * Math.PI * 54}
                                      strokeDashoffset={2 * Math.PI * 54 * (1 - processedPercent / 100)}
                                      className="transition-all duration-500 ease-out"
                                    />
                                  </svg>
                                  <span className="absolute text-2xl font-extrabold text-[#111]">{processedPercent}%</span>
                                </div>
                                <p className="text-xs font-bold text-[#131b2e] text-center mt-3">Executive Alignment Prepared</p>
                                <p className="text-[10px] text-[#515f74] text-center max-w-[180px] mt-1 leading-normal">
                                  Checked actions are marked as aligned for the executive's ready deck.
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                alert("Action items synced to executive briefing materials.");
                              }}
                              className="w-full bg-[#131b2e] hover:bg-black text-white text-xs font-bold py-2.5 rounded shadow-sm transition-colors text-center cursor-pointer"
                            >
                              Sync to Calendar Briefings
                            </button>
                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Back to Intake Button */}
                  <div className="flex justify-start pt-6">
                    <button
                      onClick={() => setActiveScreen("briefings")}
                      className="text-xs font-bold text-[#515f74] hover:text-[#131b2e] flex items-center gap-1 transition-colors bg-white border border-[#eceef0] py-2 px-4 rounded shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#131b2e]" />
                      <span>Back to Intake Briefing Hub</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* MOBILE BOTTOM TOOLBAR */}
      <nav className="md:hidden flex justify-around items-center bg-white h-16 border-t border-[#eceef0] px-2 sticky bottom-0 z-40">
        <button 
          onClick={() => {
            if (briefingData) {
              setActiveScreen("dashboard");
              setActiveDashboardTab("agenda");
            } else {
              alert("Select preloaded scenario or trigger analysis first.");
            }
          }}
          disabled={!briefingData}
          className={`flex flex-col items-center ${activeScreen === "dashboard" ? "text-[#131b2e]" : "text-[#515f74] opacity-50"}`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveScreen("briefings")}
          className={`flex flex-col items-center ${activeScreen === "briefings" ? "text-[#131b2e]" : "text-[#515f74]"}`}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Intake Hub</span>
        </button>
      </nav>

      {/* MODAL 2: DOCUMENT CONTENT INSPECTOR */}
      {inspectingFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#eceef0] rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#eceef0] pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#131b2e]" strokeWidth={2.5} />
                <h3 className="text-sm font-bold text-[#131b2e] truncate max-w-sm">
                  {inspectingFile.name}
                </h3>
              </div>
              <button 
                onClick={() => setInspectingFile(null)}
                className="text-xs font-bold text-[#515f74] hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs text-[#515f74]">
                <span>Size: <strong>{inspectingFile.size}</strong></span>
                <span>•</span>
                <span>Type: <strong>{inspectingFile.name.split(".").pop()?.toUpperCase()} Document</strong></span>
                <span>•</span>
                <span>Status: <strong>{inspectingFile.status}</strong></span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#515f74] uppercase block mb-1">Factual Contents parsed by assistant:</label>
                <div className="bg-[#f2f4f6] border border-[#c6c6cd] p-4 text-xs rounded h-60 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed">
                  {inspectingFile.content}
                </div>
              </div>

              <div className="p-3 bg-[#dae2fd]/30 rounded border border-[#dae2fd]/50 text-xs text-[#001a42] leading-normal flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 text-[#004395]" />
                <span>
                  The assistant will extract facts from this exact document block to prepare grounded findings. If this contradicts other documents, conflict details will be highlighted.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setInspectingFile(null)}
                className="px-5 py-1.5 bg-[#131b2e] text-white text-xs font-bold rounded"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
