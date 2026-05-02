import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Cpu, Lightbulb, PhoneCall, Radio, Settings2, Wifi, Fan, Lock, Power, Video, BatteryFull, Move, ChevronLeft, ChevronRight, Apple, Play, X, Mail, Lock as LockIcon, User, Send, Battery, BatteryWarning } from 'lucide-react';

const landingFeatures = [
  {
    title: "BẬT TẮT TỪ XA",
    desc: "Điều khiển đèn, quạt, và mọi thiết bị IoT trong phòng qua lưới mạng trung tâm. Kiểm soát quyền lực bằng một nút bấm.",
    number: "01"
  },
  {
    title: "GIAO TIẾP ÂM THANH",
    desc: "Thực hiện cuộc gọi trực tiếp qua hệ thống loa & mic trên body của Robot Aron. Không delay, không giới hạn.",
    number: "02"
  },
  {
    title: "ĐIỀU KHIỂN TỪ XA",
    desc: "Chiếm quyền điều khiển, di chuyển robot linh hoạt đi khắp nhà để quan sát và hỗ trợ từ xa mọi lúc mọi nơi.",
    number: "03"
  },
  {
    title: "GIÁM SÁT THÔNG MINH",
    desc: "Aron tự động tuần tra và gửi cảnh báo về điện thoại khi có dấu hiệu lạ, mang lại an tâm tuyệt đối.",
    number: "04"
  }
];

function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove, isDragging };
}

const PhoneMockup = ({ time }: { time: string }) => {
  const [lightsOn, setLightsOn] = useState(true);
  const [acOn, setAcOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [acTemp, setAcTemp] = useState(24);
  const [battery, setBattery] = useState(86);
  const [messages, setMessages] = useState<{sender: 'ai'|'user', text: string}[]>([
    { sender: 'ai', text: "Xin chào! Nhiệt độ phòng đang là 28°C. Bạn có muốn bật điều hòa không?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionDrag = useDraggableScroll();

  const suggestions = [
    "Bật điều hòa 24 độ",
    "Bật đèn phòng khách",
    "Bật quạt",
    "Kiểm tra pin"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleLights = () => {
    const newState = !lightsOn;
    setLightsOn(newState);
    showNotification(newState ? "Đã bật Đèn phòng khách" : "Đã tắt Đèn phòng khách");
  };

  const handleToggleAC = () => {
    const newState = !acOn;
    setAcOn(newState);
    showNotification(newState ? `Đã bật Điều hòa (${acTemp}°C)` : "Đã tắt Điều hòa");
  };

  const handleToggleFan = () => {
    const newState = !fanOn;
    setFanOn(newState);
    showNotification(newState ? "Đã bật Quạt" : "Đã tắt Quạt");
  };

  const processCommand = (text: string) => {
    const lower = text.toLowerCase();
    let aiResponse = "Đã nhận yêu cầu của bạn!";
    
    if (lower.includes("đèn")) {
       const isTurningOn = lower.includes("bật") || !lower.includes("tắt");
       setLightsOn(isTurningOn);
       aiResponse = isTurningOn ? "Tôi đã bật đèn phòng khách sáng lên rồi nhé." : "Đã tắt đèn phòng khách.";
       showNotification(isTurningOn ? "AI đã bật Đèn" : "AI đã tắt Đèn");
    } else if (lower.includes("điều hòa") || lower.includes("mát") || lower.includes("lạnh")) {
       const tempMatch = lower.match(/(\d+)\s*độ/);
       if (tempMatch) {
          const temp = parseInt(tempMatch[1]);
          if (temp >= 16 && temp <= 30) {
            aiResponse = `Tôi đã bật điều hòa ở mức ${temp}°C cho bạn.`;
            setAcOn(true);
            setAcTemp(temp);
            showNotification(`Điều hòa: ${temp}°C`);
          } else {
            aiResponse = `Mức nhiệt độ ${temp}°C không hợp lệ. Điều hòa chỉ hỗ trợ từ 16 đến 30 độ.`;
          }
       } else {
          const isTurningOn = lower.includes("bật") || !lower.includes("tắt");
          setAcOn(isTurningOn);
          aiResponse = isTurningOn ? `Đã bật điều hòa ở mức ${acTemp}°C.` : "Đã tắt điều hòa.";
          showNotification(isTurningOn ? "AI đã bật Điều hòa" : "AI đã tắt Điều hòa");
       }
    } else if (lower.includes("quạt")) {
       const isTurningOn = lower.includes("bật") || !lower.includes("tắt");
       setFanOn(isTurningOn);
       aiResponse = isTurningOn ? "Tôi đã bật quạt cho bạn rồi." : "Đã tắt quạt theo yêu cầu.";
       showNotification(isTurningOn ? "AI đã bật Quạt" : "AI đã tắt Quạt");
    } else if (lower.includes("pin") || lower.includes("năng lượng") || lower.includes("sạc")) {
       aiResponse = `Mức pin hiện tại của tôi là ${battery}%. Mọi thứ vẫn đang hoạt động tốt.`;
    } else if (lower.includes("tắt")) {
       aiResponse = "Tôi đã xử lý yêu cầu tắt thiết bị.";
    } else if (lower.includes("bật")) {
       aiResponse = "Tôi đã bật thiết bị theo ý bạn.";
    } else {
       aiResponse = "Xin lỗi, tôi chưa hiểu rõ yêu cầu này. Bạn có thể nói rõ là muốn tác động đến thiết bị nào không?";
    }
    
    setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: newMsg }]);
    setInputText("");
    setTimeout(() => processCommand(newMsg), 800);
  };

  const handleSuggestion = (text: string) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setTimeout(() => processCommand(text), 800);
  };

  return (
  <div className="relative w-[360px] h-[720px] bg-slate-900 rounded-[3.5rem] p-2.5 shadow-2xl border-[2px] border-slate-600 ring-[6px] ring-slate-900 mx-auto">
    <AnimatePresence>
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.9 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          exit={{ opacity: 0, y: -10, scale: 0.9 }} 
          className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap border border-slate-700"
        >
          {notification}
        </motion.div>
      )}
    </AnimatePresence>
    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-40 flex items-center justify-between px-3 shadow-md">
      <div className="w-2.5 h-2.5 bg-gray-900 rounded-full flex items-center justify-center">
         <div className="w-1.5 h-1.5 bg-blue-900/40 rounded-full"></div>
      </div>
      <div className="w-1 h-1 bg-green-500 rounded-full opacity-70"></div>
    </div>
    <div className="w-full h-full bg-slate-50 rounded-[3rem] overflow-hidden flex flex-col font-sans relative">
      <div className="absolute top-0 left-0 right-0 h-14 flex justify-between items-start px-8 pt-4 z-20 text-[12px] font-bold text-slate-900 bg-transparent pointer-events-none">
        <span className="w-10 text-center tracking-tight">{time || "09:41"}</span>
        <div className="flex gap-1.5 items-center w-10 justify-end">
           <Wifi className="w-4 h-4" />
           {battery > 20 ? <BatteryFull className="w-5 h-5 text-slate-900" /> : <BatteryWarning className="w-5 h-5 text-red-500" />}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col p-5 bg-white pt-16">
        <div className="flex justify-between items-center mb-4">
           <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Bảng điều khiển Aron</div>
           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
             <Bot className="w-5 h-5 text-slate-600" />
           </div>
        </div>
        <div className="bg-blue-600 rounded-3xl p-5 text-white shadow-md mb-4 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
           <div className="flex items-center gap-2 mb-2 relative z-10">
             <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
             <span className="text-xs font-medium text-blue-100">Trạng thái Robot</span>
           </div>
           <div className="font-bold text-lg relative z-10">Đang hoạt động</div>
           <div className="mt-4 flex justify-between items-end relative z-10">
             <div className="text-3xl font-mono tracking-tight font-light flex items-center gap-1">
               {battery}%
             </div>
             <div className="text-[10px] uppercase font-bold tracking-widest text-blue-200">Năng lượng</div>
           </div>
        </div>
        <div className="space-y-3 mb-4">
           <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100" onClick={handleToggleLights}>
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-colors ${lightsOn ? 'bg-yellow-50 text-yellow-500' : 'bg-white text-slate-400'}`}>
                 <Lightbulb className="w-5 h-5" />
               </div>
               <span className="text-sm font-semibold text-slate-800">Đèn phòng khách</span>
             </div>
             <div className={`w-11 h-6 rounded-full relative shadow-inner cursor-pointer transition-colors active:scale-95 ${lightsOn ? 'bg-blue-500' : 'bg-slate-300'}`}>
               <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${lightsOn ? 'left-[22px]' : 'left-0.5'}`}></div>
             </div>
           </div>
           <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100" onClick={handleToggleAC}>
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-colors ${acOn ? 'bg-blue-50 text-blue-500' : 'bg-white text-slate-400'}`}>
                 <Fan className={`w-5 h-5 ${acOn ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
               </div>
               <span className="text-sm font-semibold text-slate-800">Điều hòa</span>
             </div>
             <div className={`w-11 h-6 rounded-full relative shadow-inner cursor-pointer transition-colors active:scale-95 ${acOn ? 'bg-blue-500' : 'bg-slate-300'}`}>
               <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${acOn ? 'left-[22px]' : 'left-0.5'}`}></div>
             </div>
           </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
             </span>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trợ lý AI Aron</span>
          </div>
          
          {/* Scrollable messages container */}
          <div className="flex flex-col gap-2 relative max-h-[140px] overflow-y-auto hide-scrollbar scroll-smooth mb-2">
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender === 'ai' 
                ? "bg-blue-100 text-blue-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] w-[85%] leading-relaxed" 
                : "bg-slate-800 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[13px] w-[75%] self-end text-right"}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div 
            ref={suggestionDrag.ref as any}
            onMouseDown={suggestionDrag.onMouseDown}
            onMouseLeave={suggestionDrag.onMouseLeave}
            onMouseUp={suggestionDrag.onMouseUp}
            onMouseMove={suggestionDrag.onMouseMove}
            className={`flex gap-2 overflow-x-auto hide-scrollbar pb-2 pt-1 mb-1 ${suggestionDrag.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {suggestions.map((sug, i) => (
              <button 
                key={i} 
                onClick={() => handleSuggestion(sug)}
                className={`whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 font-medium hover:bg-slate-100 hover:text-blue-600 transition-colors flex-shrink-0 ${suggestionDrag.isDragging ? 'pointer-events-none' : ''}`}
              >
                {sug}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center bg-white rounded-full px-3 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Bạn muốn hỏi gì..." 
              className="text-[13px] text-slate-700 font-medium flex-1 bg-transparent outline-none w-full"
            />
            <button type="submit" disabled={!inputText.trim()} className="ml-2 bg-blue-600 rounded-full p-1.5 text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm">
              <Send className="w-4 h-4 flex-shrink-0" />
            </button>
          </form>
        </div>
        <div className="mt-auto">
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-md hover:bg-slate-800 active:scale-95 transition-all">
             Điều khiển Camera Robot
          </button>
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-slate-300 rounded-full z-20" />
    </div>
  </div>
  );
};

const AuthModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">Aron IoT</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản mới'}</h2>
          <p className="text-sm text-slate-500 mb-8">{isLogin ? 'Chào mừng bạn quay trở lại với Aron' : 'Bắt đầu hành trình IoT của bạn cùng Aron'}</p>

          <form onSubmit={(e) => { e.preventDefault(); onSuccess(); }} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 text-left">Họ và Tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input type="text" className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Nguyễn Văn A" required />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 text-left">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input type="email" className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="email@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 text-left">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input type="password" className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="••••••••" required />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold text-sm shadow-md hover:bg-slate-800 transition-all mt-4 active:scale-[0.98]">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold hover:underline">
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const RobotIllustration = () => {
  return (
    <div className="relative w-64 h-80 flex flex-col items-center justify-end animate-bounce" style={{ animationDuration: '3s' }}>
      {/* Antennas */}
      <div className="absolute top-0 flex gap-10">
        <div className="w-1.5 h-10 bg-white rounded-t-sm" />
        <div className="w-1.5 h-10 bg-white rounded-t-sm" />
      </div>
      <div className="absolute top-[-10px] flex gap-[36px]">
        <div className="w-6 h-3 bg-blue-500 rounded-sm" />
        <div className="w-6 h-3 bg-blue-500 rounded-sm" />
      </div>
      
      {/* Head */}
      <div className="w-48 h-40 bg-orange-400 rounded-[1.5rem] relative z-20 shadow-xl overflow-hidden flex items-center justify-center">
         {/* Face plate */}
         <div className="w-[140px] h-[90px] bg-orange-300 rounded-[2rem] flex pl-4 pr-4 border-b-4 border-orange-500 overflow-hidden">
           <div className="w-full flex items-center justify-between mt-2">
             <div className="w-10 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
               <div className="w-4 h-8 bg-slate-900 rounded-full" />
             </div>
             <div className="w-6 h-1 mt-10 bg-slate-800 rounded-full" />
             <div className="w-10 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
               <div className="w-4 h-8 bg-slate-900 rounded-full" />
             </div>
           </div>
         </div>
      </div>
      
      {/* Ears/Headphones */}
      <div className="absolute top-20 -left-3 w-4 h-12 bg-green-400 rounded-l-full z-10" />
      <div className="absolute top-20 -right-3 w-4 h-12 bg-green-400 rounded-r-full z-10" />

      {/* Body */}
      <div className="w-36 h-32 bg-orange-400 mt-1 rounded-2xl relative z-10 flex flex-col items-center justify-start pt-6 shadow-lg">
        {/* Detail lines */}
        <div className="w-full h-1 bg-white/30 absolute top-3"></div>
        {/* FPT Logo */}
        <div className="text-blue-600 font-black text-sm tracking-widest opacity-80 ml-10 mt-2">FPT</div>
        
        {/* Arms */}
        <div className="absolute top-2 -left-10 w-8 h-20 bg-orange-400 rounded-full origin-top transform rotate-[15deg] flex flex-col items-center animate-pulse" style={{ animationDuration: '4s' }}>
             <div className="w-8 h-1 bg-white/50 mt-8 mb-1"></div>
             <div className="w-8 h-1 bg-white/50 mb-2"></div>
             <div className="mt-auto w-10 h-10 bg-white rounded-xl shadow-sm -ml-1 flex items-end"><div className="w-2 h-4 bg-slate-200 ml-2 rounded-t-sm"></div></div>
        </div>
        <div className="absolute top-2 -right-10 w-8 h-20 bg-orange-400 rounded-full origin-top transform -rotate-[15deg] flex flex-col items-center animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}>
             <div className="w-8 h-1 bg-white/50 mt-8 mb-1"></div>
             <div className="w-8 h-1 bg-white/50 mb-2"></div>
             <div className="mt-auto w-10 h-10 bg-white rounded-xl shadow-sm -mr-1 flex items-end"><div className="w-2 h-4 bg-slate-200 mr-2 ml-auto rounded-t-sm"></div></div>
        </div>
      </div>
      
      {/* Shorts */}
      <div className="w-36 h-8 bg-amber-100 -mt-1 rounded-b-md z-20 flex justify-center gap-2 border-b-2 border-amber-200">
         <div className="w-1 h-full bg-orange-300"></div>
      </div>
      {/* Legs */}
      <div className="flex gap-6 relative -top-1 z-0">
        <div className="w-8 h-12 bg-orange-400 border-2 border-orange-500 rounded-b-sm" />
        <div className="w-8 h-12 bg-orange-400 border-2 border-orange-500 rounded-b-sm" />
      </div>
      {/* Feet */}
      <div className="flex gap-4 absolute bottom-[-5px] z-10">
        <div className="w-10 h-4 bg-white rounded-t-lg shadow-sm border-b-2 border-slate-200" />
        <div className="w-10 h-4 bg-white rounded-t-lg shadow-sm border-b-2 border-slate-200" />
      </div>
    </div>
  )
};

const ProductsPage = ({ setPage }: { setPage: (page: any) => void }) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/40 rounded-full -z-10 blur-3xl pointer-events-none" />
      <div className="flex justify-between items-center mb-12 max-w-5xl mx-auto w-full relative z-20">
        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer" onClick={() => setPage('landing')}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 lg:w-5 lg:h-5 border-[2.5px] border-white rounded-full"></div>
          </div>
          <span className="text-xl lg:text-2xl font-bold tracking-tight uppercase">Aron IoT</span>
        </div>
        <button onClick={() => setPage('landing')} className="text-xs lg:text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">Trang chủ</button>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 py-6 lg:py-10 z-20 relative">
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-2 border border-orange-100 w-fit">2D Animation Style</div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">Robot Trợ Lý<br className="hidden lg:block"/><span className="text-orange-500"> Aron V1</span></h1>
          <p className="text-base lg:text-lg text-slate-500 max-w-md">Thiết kế nhỏ gọn, biểu cảm linh hoạt. Aron V1 là trung tâm điều khiển IoT trong hình hài một người bạn đồng hành 2D ngộ nghĩnh.</p>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 mt-2 lg:mt-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex-1">
              <div className="font-bold text-xl text-orange-500 mb-1">Wi-Fi 6</div>
              <div className="text-[10px] lg:text-xs text-slate-500 uppercase tracking-wide">Kết nối tốc độ cao</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex-1">
              <div className="font-bold text-xl text-orange-500 mb-1">10h+</div>
              <div className="text-[10px] lg:text-xs text-slate-500 uppercase tracking-wide">Thời lượng pin</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex-1">
              <div className="font-bold text-xl text-orange-500 mb-1">AI</div>
              <div className="text-[10px] lg:text-xs text-slate-500 uppercase tracking-wide">Xử lý ngôn ngữ</div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center w-full min-h-[300px] lg:min-h-[400px]">
           <div className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] bg-white rounded-full shadow-2xl flex items-center justify-center relative border border-slate-100 scale-90 lg:scale-100">
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-orange-200 animate-spin-slow" style={{ animationDuration: '20s' }}></div>
              <RobotIllustration />
           </div>
        </div>
      </div>
    </div>
  );
};

const FeaturesPage = ({ setPage }: { setPage: (page: any) => void }) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col p-6 lg:p-12 relative overflow-hidden">
      <div className="flex justify-between items-center mb-10 lg:mb-16 max-w-5xl mx-auto w-full relative z-20">
        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer" onClick={() => setPage('landing')}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 lg:w-5 lg:h-5 border-[2.5px] border-white rounded-full"></div>
          </div>
          <span className="text-xl lg:text-2xl font-bold tracking-tight uppercase">Aron IoT</span>
        </div>
        <button onClick={() => setPage('landing')} className="text-xs lg:text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">Trang chủ</button>
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-20 mb-12 lg:mb-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-4 lg:mb-6">Tính năng <span className="text-blue-600">nổi bật</span></h1>
        <p className="text-slate-500 text-base lg:text-lg max-w-2xl mx-auto px-4">Tất cả những gì bạn cần để tự động hóa ngôi nhà, tích hợp trong một hệ thống đồng nhất.</p>
      </div>

      <div className="max-w-6xl mx-auto w-full flex flex-col gap-16 lg:gap-24 relative z-20 pb-16 lg:pb-20">
        {landingFeatures.map((feature, idx) => (
          <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>
            <div className="flex-1 flex flex-col gap-3 lg:gap-4 text-center lg:text-left px-4 lg:px-0">
              <div className="text-blue-600 font-black text-xl lg:text-2xl opacity-50 mb-1 lg:mb-2">0{idx + 1}</div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{feature.title}</h2>
              <p className="text-slate-500 text-base lg:text-lg leading-relaxed">{feature.desc}</p>
            </div>
            <div className="flex-1 w-full flex justify-center">
              <div className="w-full aspect-[4/3] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative flex items-center justify-center">
                {/* Animation Previews */}
                {idx === 0 && (
                  <div className="grid grid-cols-2 gap-4 w-1/2">
                    <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center animate-pulse"><Lightbulb className="w-8 h-8 text-yellow-500" /></div>
                    <div className="aspect-square bg-blue-500 rounded-2xl flex items-center justify-center"><Power className="w-8 h-8 text-white" /></div>
                    <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center"><Fan className="w-8 h-8 text-slate-400" /></div>
                    <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center"><Radio className="w-8 h-8 text-slate-400" /></div>
                  </div>
                )}
                {idx === 1 && (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-blue-100 flex items-center justify-center animate-ping absolute inset-0 m-auto"></div>
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center relative z-10 shadow-lg">
                      <PhoneCall className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                {idx === 2 && (
                  <div className="w-48 h-48 bg-slate-900 rounded-full flex items-center justify-center relative shadow-2xl">
                    <div className="absolute top-4 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white"><ChevronLeft className="w-5 h-5 rotate-90" /></div>
                    <div className="absolute bottom-4 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white"><ChevronRight className="w-5 h-5 rotate-90" /></div>
                    <div className="absolute left-4 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white"><ChevronLeft className="w-5 h-5" /></div>
                    <div className="absolute right-4 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white"><ChevronRight className="w-5 h-5" /></div>
                    <div className="w-16 h-16 bg-blue-500 rounded-full shadow-inner shadow-blue-700 flex items-center justify-center"><Move className="w-6 h-6 text-white" /></div>
                  </div>
                )}
                {idx === 3 && (
                  <div className="w-3/4 h-3/4 bg-slate-900 rounded-2xl relative overflow-hidden shadow-2xl">
                     <div className="absolute top-4 left-4 flex gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="text-[8px] text-white font-mono opacity-80 uppercase tracking-widest">REC</span></div>
                     <div className="absolute inset-0 m-auto w-full h-[2px] bg-green-500/30 animate-scan"></div>
                     <div className="w-full h-full flex items-center justify-center">
                       <Video className="w-12 h-12 text-slate-700" />
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [time, setTime] = useState("");
  const [page, setPage] = useState<'landing' | 'demo' | 'products' | 'features'>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const desktopDrag = useDraggableScroll();
  const mobileDrag = useDraggableScroll();

  const handleScroll = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      setTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
    setPage('demo');
  };

  if (page === 'products') return <ProductsPage setPage={setPage} />;
  if (page === 'features') return <FeaturesPage setPage={setPage} />;

  if (page === 'demo') {
    return (
      <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col p-6 lg:p-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/40 rounded-full -z-10 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center mb-8 lg:mb-12 max-w-5xl mx-auto w-full relative z-20">
          <div className="flex items-center gap-2 lg:gap-3 cursor-pointer" onClick={() => setPage('landing')}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 lg:w-5 lg:h-5 border-[2.5px] border-white rounded-full"></div>
            </div>
            <span className="text-xl lg:text-2xl font-bold tracking-tight uppercase">Aron IoT</span>
          </div>
          <button 
            onClick={() => setPage('landing')}
            className="text-xs lg:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        <div className="text-center mb-8 lg:mb-10 relative z-20">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 lg:mb-4 border border-green-100">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Demo Online
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Trải nghiệm <span className="text-blue-600">bảng điều khiển</span></h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-start pb-20 relative z-20 px-2 lg:px-0">
          <div className="transform scale-[0.85] sm:scale-100 w-full flex justify-center origin-top">
            <PhoneMockup time={time} />
          </div>

          <motion.div 
            className="mt-6 lg:mt-12 w-full max-w-2xl bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">Tải app để truy cập toàn bộ tính năng</h3>
            <p className="text-slate-500 text-xs lg:text-sm mb-6 lg:mb-8 max-w-md mx-auto">Trải nghiệm quản lý không dây đích thực với ứng dụng chính thức của Aron IoT. Có mặt trên cả hai nền tảng phỏ biến.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
              <button className="flex items-center justify-center gap-3 bg-slate-900 text-white rounded-2xl px-6 py-4 hover:bg-slate-800 active:scale-95 transition-all w-full sm:w-auto">
                <Apple className="w-7 h-7" />
                 <div className="text-left leading-tight">
                    <div className="text-[10px] text-slate-300">Download on the</div>
                    <div className="font-bold text-sm tracking-wide">App Store</div>
                 </div>
              </button>
              <button className="flex items-center justify-center gap-3 bg-slate-900 text-white rounded-2xl px-6 py-4 hover:bg-slate-800 active:scale-95 transition-all w-full sm:w-auto">
                <Play className="w-7 h-7" />
                 <div className="text-left leading-tight">
                    <div className="text-[10px] text-slate-300">GET IT ON</div>
                    <div className="font-bold text-sm tracking-wide">Google Play</div>
                 </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-slate-50 text-slate-900 font-sans relative">
      
      <div className="w-full px-4 sm:px-6 lg:px-12 py-4 sm:py-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white rounded-full"></div>
          </div>
          <span className="text-base md:text-xl font-bold tracking-tight uppercase truncate">Aron IoT</span>
        </div>
        <div className="flex gap-3 md:gap-4 lg:gap-8 text-[11px] sm:text-xs md:text-sm font-medium text-slate-500 items-center shrink-0">
          <span onClick={() => setPage('products')} className="cursor-pointer hover:text-slate-800 transition-colors">Sản phẩm</span>
          <span onClick={() => setPage('features')} className="cursor-pointer hover:text-slate-800 transition-colors">Tính năng</span>
          <button onClick={() => setIsAuthOpen(true)} className="text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5 rounded-full transition-all">
             Bắt đầu →
          </button>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full -z-10 blur-3xl pointer-events-none" />

      <main className="flex-1 flex w-full max-w-[1400px] mx-auto flex-col xl:flex-row gap-16 xl:gap-12 px-6 lg:px-12 z-10 items-center py-10">
        
        <div className="flex-1 w-full flex flex-col justify-center gap-6 xl:pr-16 mt-8 xl:mt-0 text-center xl:text-left items-center xl:items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6 lg:gap-8 items-center xl:items-start"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Dự án Mini IoT chuyên sâu
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.1] xl:leading-[1.05] tracking-tighter">
              Linh hoạt hơn<br/>
              <span className="text-blue-600">với Aron.</span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-500 max-w-xl leading-relaxed">
              Khám phá thế giới IoT thông qua mô hình robot quản gia thông minh. Kết nối, điều khiển và tương tác với ngôi nhà của bạn từ bất cứ đâu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-5 mt-2 lg:mt-4 w-full sm:w-auto">
              <button onClick={() => setIsAuthOpen(true)} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-base lg:text-lg font-bold shadow-xl hover:bg-slate-800 transition-all hover:shadow-2xl active:scale-95 text-center">
                Trải nghiệm ngay
              </button>
              <button className="w-full sm:w-auto border border-slate-200 bg-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-base lg:text-lg font-bold text-slate-800 hover:bg-slate-50 transition-all active:scale-95 text-center shadow-sm">
                Xem hướng dẫn
              </button>
            </div>
          </motion.div>
        </div>

        <div className="relative flex flex-1 justify-center items-center w-full xl:justify-end pb-12 xl:pb-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", delay: 0.2 }}
            className="transform scale-[0.85] sm:scale-90 md:scale-100 origin-top xl:origin-center"
          >
            <PhoneMockup time={time} />
          </motion.div>
        </div>
      </main>

      <div className="w-full hidden lg:block pb-10 pt-4 z-20 group/slider relative">
        <button 
          onClick={() => handleScroll('left', desktopDrag.ref)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-full shadow-md opacity-0 group-hover/slider:opacity-100 transition-all backdrop-blur-sm active:scale-95 border border-slate-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => handleScroll('right', desktopDrag.ref)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-full shadow-md opacity-0 group-hover/slider:opacity-100 transition-all backdrop-blur-sm active:scale-95 border border-slate-200"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        <motion.div 
          ref={desktopDrag.ref as any}
          onMouseDown={desktopDrag.onMouseDown}
          onMouseLeave={desktopDrag.onMouseLeave}
          onMouseUp={desktopDrag.onMouseUp}
          onMouseMove={desktopDrag.onMouseMove}
          className={`flex gap-6 px-12 overflow-x-auto hide-scrollbar max-w-[1400px] mx-auto ${desktopDrag.isDragging ? 'snap-none cursor-grabbing' : 'snap-x cursor-grab'}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          {landingFeatures.map((feature, idx) => (
            <div 
              key={idx} 
              className={`min-w-[340px] snap-center bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all group ${desktopDrag.isDragging ? 'pointer-events-none' : ''}`}
            >
              <div className="text-blue-600 mb-4 font-bold text-xl">{feature.number}</div>
              <h3 className="font-bold text-base mb-3 uppercase tracking-wide text-slate-900 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
      </div>

      <div className="w-full lg:hidden px-6 relative z-20 pb-12 pt-4 group/sliderMobile">
        <div 
          ref={mobileDrag.ref as any}
          onMouseDown={mobileDrag.onMouseDown}
          onMouseLeave={mobileDrag.onMouseLeave}
          onMouseUp={mobileDrag.onMouseUp}
          onMouseMove={mobileDrag.onMouseMove}
          className={`flex gap-4 overflow-x-auto hide-scrollbar snap-mandatory ${mobileDrag.isDragging ? 'snap-none cursor-grabbing' : 'snap-x cursor-grab'}`}
        >
          {landingFeatures.map((feature, idx) => (
            <div 
              key={idx} 
              className={`min-w-[85vw] sm:min-w-[300px] snap-center bg-white border border-slate-200 p-6 rounded-2xl shadow-sm ${mobileDrag.isDragging ? 'pointer-events-none' : ''}`}
            >
              <div className="text-blue-600 mb-2 lg:mb-3 font-bold text-base lg:text-lg">{feature.number}</div>
              <h3 className="font-bold text-sm mb-1.5 lg:mb-2 uppercase tracking-wide text-slate-900">{feature.title}</h3>
              <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
      </div>

      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={handleAuthSuccess} />
        )}
      </AnimatePresence>

      <footer className="w-full bg-slate-900 text-slate-400 py-10 lg:py-16 px-6 lg:px-12 z-20 mt-auto rounded-t-3xl sm:rounded-t-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-xl font-bold tracking-tight uppercase text-white">Aron IoT</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed">
              Giải pháp nhà thông minh toàn diện, điều khiển mọi thiết bị trong không gian sống của bạn thông qua một giao diện duy nhất, dễ dàng và an toàn.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Khám phá</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => setPage('products')} className="hover:text-blue-400 transition-colors">Sản phẩm</button></li>
              <li><button onClick={() => setPage('features')} className="hover:text-blue-400 transition-colors">Tính năng</button></li>
              <li><button onClick={() => setPage('demo')} className="hover:text-blue-400 transition-colors">Trải nghiệm Demo</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li><span className="cursor-pointer hover:text-blue-400 transition-colors">Hỗ trợ khách hàng</span></li>
              <li><span className="cursor-pointer hover:text-blue-400 transition-colors">Tài liệu API</span></li>
              <li><span className="cursor-pointer hover:text-blue-400 transition-colors">Tuyển dụng</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs relative z-10">
          <p>© {new Date().getFullYear()} Aron IoT. Tự hào tạo ra tại Việt Nam.</p>
          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-white transition-colors">Điều khoản dịch vụ</span>
            <span className="cursor-pointer hover:text-white transition-colors">Chính sách bảo mật</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

