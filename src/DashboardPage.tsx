import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Phone, Plus, Power, ShieldAlert, CheckCircle2, XCircle, Home, Tv, Fan, ThermometerSnowflake, Lightbulb, UserRound, ArrowLeft, X } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'light' | 'ac' | 'tv' | 'fan';
  isOn: boolean;
}

interface ActionLog {
  id: string;
  timestamp: Date;
  command: string;
  response: string;
  status: 'success' | 'error' | 'pending';
}

const initialDevices: Device[] = [
  { id: '1', name: 'Đèn phòng khách', type: 'light', isOn: false },
  { id: '2', name: 'Điều hòa phòng ngủ', type: 'ac', isOn: true },
  { id: '3', name: 'TV LG OLED', type: 'tv', isOn: false },
  { id: '4', name: 'Quạt trần', type: 'fan', isOn: false },
];

export const DashboardPage = ({ setPage, user, handleLogout }: { setPage: (p: any) => void, user: any, handleLogout: () => void }) => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [contacts, setContacts] = useState<string[]>(['Mẹ', 'Bố', 'Vợ', 'Sếp', 'Công an']);
  const [inputText, setInputText] = useState("");
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceType, setNewDeviceType] = useState<'light' | 'ac' | 'tv' | 'fan'>('light');

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'vi-VN';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setInputText(speechResult);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome.");
      }
    }
  };

  const addLog = (command: string, response: string, status: 'success' | 'error' | 'pending') => {
    const newLog: ActionLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      command,
      response,
      status
    };
    setLogs(prev => [...prev, newLog]);
  };

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Emergency
    if (lowerCommand.includes('khẩn cấp') || lowerCommand.includes('bệnh viện') || lowerCommand.includes('cấp cứu')) {
      addLog(command, 'Đang gọi bệnh viện gần nhất và gửi vị trí hiện tại của bạn...', 'success');
      return;
    }

    // Calling
    if (lowerCommand.includes('gọi điện') || lowerCommand.includes('gọi cho')) {
      const foundContact = contacts.find(c => lowerCommand.includes(c.toLowerCase()));
      if (foundContact) {
        addLog(command, `Đang kết nối cuộc gọi đến ${foundContact}...`, 'success');
      } else {
        addLog(command, 'Không tìm thấy người liên hệ trong danh bạ bốt.', 'error');
      }
      return;
    }

    // Devices ON
    if (lowerCommand.includes('bật')) {
      let matched = false;
      const updatedDevices = devices.map(d => {
        if (lowerCommand.includes(d.name.toLowerCase()) || 
            (lowerCommand.includes('đèn') && d.type === 'light') ||
            (lowerCommand.includes('điều hòa') && d.type === 'ac') ||
            (lowerCommand.includes('tv') || lowerCommand.includes('tivi') && d.type === 'tv') ||
            (lowerCommand.includes('quạt') && d.type === 'fan')) {
          matched = true;
          return { ...d, isOn: true };
        }
        return d;
      });

      if (matched) {
        setDevices(updatedDevices);
        addLog(command, 'Đã bật thiết bị theo yêu cầu.', 'success');
      } else {
        addLog(command, 'Không tìm thấy thiết bị phù hợp để bật.', 'error');
      }
      return;
    }

    // Devices OFF
    if (lowerCommand.includes('tắt')) {
      let matched = false;
      const updatedDevices = devices.map(d => {
        if (lowerCommand.includes(d.name.toLowerCase()) || 
            (lowerCommand.includes('đèn') && d.type === 'light') ||
            (lowerCommand.includes('điều hòa') && d.type === 'ac') ||
            (lowerCommand.includes('tv') || lowerCommand.includes('tivi') && d.type === 'tv') ||
            (lowerCommand.includes('quạt') && d.type === 'fan')) {
          matched = true;
          return { ...d, isOn: false };
        }
        return d;
      });

      if (matched) {
        setDevices(updatedDevices);
        addLog(command, 'Đã tắt thiết bị theo yêu cầu.', 'success');
      } else {
        addLog(command, 'Không tìm thấy thiết bị phù hợp để tắt.', 'error');
      }
      return;
    }

    // Fallback
    addLog(command, 'Tôi chưa hiểu yêu cầu này, vui lòng thử lệnh khác (bật đèn, gọi trợ giúp, khẩn cấp...).', 'error');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    processCommand(inputText);
    setInputText("");
  };

  const toggleDevice = (id: string) => {
    setDevices(devices.map(d => d.id === id ? { ...d, isOn: !d.isOn } : d));
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    setDevices([...devices, { id: Date.now().toString(), name: newDeviceName, type: newDeviceType, isOn: false }]);
    setNewDeviceName("");
    setIsAddDeviceOpen(false);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    if (!contacts.includes(newContactName)) {
      setContacts([...contacts, newContactName]);
    }
    setNewContactName("");
    setIsAddContactOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setPage('landing')} className="text-slate-500 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">All In One Hub</h1>
            <p className="text-xs text-slate-500 font-medium">Xin chào, {user?.name || "Khách"}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
          Đăng xuất
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Devices */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-500" /> Thiết bị của bạn
              </h2>
              <button onClick={() => setIsAddDeviceOpen(true)} className="bg-slate-100 text-slate-600 p-2 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {devices.map(device => {
                let Icon = Lightbulb;
                if (device.type === 'ac') Icon = ThermometerSnowflake;
                if (device.type === 'tv') Icon = Tv;
                if (device.type === 'fan') Icon = Fan;
                
                return (
                  <div key={device.id} 
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${device.isOn ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100'}`}
                    onClick={() => toggleDevice(device.id)}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${device.isOn ? 'text-blue-200' : 'text-slate-400'}`} />
                    <div className="font-semibold text-sm leading-tight mb-1">{device.name}</div>
                    <div className={`text-xs font-medium ${device.isOn ? 'text-blue-100' : 'text-slate-400'}`}>
                      {device.isOn ? 'Đang bật' : 'Đã tắt'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserRound className="w-5 h-5 text-indigo-500" /> Danh bạ Bot
               </h2>
               <button onClick={() => setIsAddContactOpen(true)} className="bg-slate-100 text-slate-600 p-2 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                 <Plus className="w-4 h-4" />
               </button>
             </div>
             <div className="flex flex-wrap gap-2">
               {contacts.map(c => (
                 <span key={c} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold">{c}</span>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Chat */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[600px] lg:h-auto">
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" /> Trợ lý thông minh
              </h2>
              <p className="text-xs text-slate-500 mt-1">Hỗ trợ nhận diện giọng nói & văn bản. Nói "khẩn cấp" để gọi ngay lập tức.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Online</span>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <Mic className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 max-w-sm">Hãy thử nhập "bật đèn phòng khách", "gọi cho Mẹ" hoặc "khẩn cấp gọi xe cứu thương". Hoặc nhấn biểu tượng micro để nói chữ.</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex flex-col gap-2 relative">
                  {/* User Command */}
                  <div className="self-end bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                    <p className="text-sm font-medium">{log.command}</p>
                    <span className="text-[10px] text-blue-200 mt-1 block text-right">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
                  
                  {/* Bot Response */}
                  <div className="self-start flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                      <ShieldAlert className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className={`px-5 py-3 rounded-2xl rounded-tl-sm border shadow-sm flex items-start gap-3 ${log.status === 'success' ? 'bg-white border-slate-200' : 'bg-red-50 border-red-100 text-red-800'}`}>
                       {log.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0 text-red-500" />}
                       <div>
                         <p className="text-sm font-medium">{log.response}</p>
                         <span className="text-[10px] text-slate-400 mt-1 block">{log.timestamp.toLocaleTimeString()}</span>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative flex items-center">
              <button 
                type="button" 
                onClick={toggleListen}
                className={`absolute left-3 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? "Đang nghe..." : "Nhập lệnh (vd: khẩn cấp, bật tivi...)"}
                className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-3 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </main>

      {/* Add Device Modal */}
      <AnimatePresence>
        {isAddDeviceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setIsAddDeviceOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-6">Thêm thiết bị mới</h2>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Tên thiết bị</label>
                  <input type="text" value={newDeviceName} onChange={e => setNewDeviceName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="vd: Máy giặt" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Loại thiết bị</label>
                  <select value={newDeviceType} onChange={e => setNewDeviceType(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none">
                    <option value="light">Đèn chiếu sáng</option>
                    <option value="ac">Điều hòa / Máy lạnh</option>
                    <option value="tv">Ti vi / Màn hình</option>
                    <option value="fan">Quạt</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold shadow-md hover:bg-blue-700 transition-all mt-6">
                  Thêm thiết bị
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {isAddContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setIsAddContactOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-6">Thêm liên hệ</h2>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Tên gợi nhớ</label>
                  <input type="text" value={newContactName} onChange={e => setNewContactName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="vd: Bác sĩ, Bạn thân" required />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold shadow-md hover:bg-indigo-700 transition-all mt-6">
                  Thêm vào danh bạ
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

