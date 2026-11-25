'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Send, Volume2, X, Sparkles, Store } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { productService } from '@/services/product.service';

interface ChatMsg {
  role: 'dukaandar' | 'user';
  text: string;
}

export function VoiceDukaandar() {
  const router = useRouter();
  const {
    voiceOpen,
    setVoiceOpen,
    viewingProduct,
    addToCart,
    toggleWishlist,
    setTryOnProduct,
  } = useUiStore();

  const [listening, setListening] = useState(false);
  const [input, setInput] = useState('');
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'dukaandar',
      text: 'Namaste ji! Main aapka BazaarSaathi Dukaandar hoon. Boliye aaj kya kharidna hai? Aap bolkar filter kar sakte hain, try-on dekh sakte hain, ya cart me daal sakte hain!',
    },
  ]);

  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    if (!speakEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
    if (indianVoice) utter.voice = indianVoice;
    utter.rate = 1.0;
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    if (voiceOpen && viewingProduct) {
      const tip = `Aap abhi "${viewingProduct.title}" (₹${viewingProduct.price}) dekh rahe hain. Kya main ise try-on karke dikhaoon ya cart me daal doon?`;
      setMessages((prev) => {
        if (prev[prev.length - 1]?.text === tip) return prev;
        return [...prev, { role: 'dukaandar', text: tip }];
      });
    }
  }, [voiceOpen, viewingProduct]);

  // Agentic Intent + Action Executor (connects to FastAPI LangGraph when online)
  const handleCommand = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    const lower = text.toLowerCase();

    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');

    let reply = '';

    // 1. Virtual Try-On Intent
    if (lower.includes('try') || lower.includes('pehen') || lower.includes('dikhao kaisa')) {
      const target = viewingProduct || (await productService.search({ tryOnOnly: true })).items[0];
      if (target && target.tryOnSupported) {
        setTryOnProduct(target);
        reply = `Bilkul! "${target.title}" ka Virtual Try-On khol raha hoon—apni photo ya sample model se dekhiye kaisa lagta hai!`;
      } else {
        reply = 'Ye product Try-On support nahi karta. Koi kurta ya saree select karein!';
      }
    }
    // 2. Add to Wishlist Intent
    else if (lower.includes('wishlist') || lower.includes('pasand') || lower.includes('save')) {
      const target = viewingProduct || (await productService.search({})).items[0];
      if (target) {
        toggleWishlist(target);
        reply = `Ji! "${target.title}" ko aapki Wishlist me save kar diya hai.`;
      }
    }
    // 3. Add to Cart Intent
    else if (lower.includes('cart') || lower.includes('kharid') || lower.includes('order')) {
      if (lower.includes('checkout') || lower.includes('cart kholo')) {
        router.push('/cart');
        reply = 'Aapka Shopping Cart khol raha hoon. Aap Gullak Wallet se turant payment kar sakte hain!';
      } else {
        const target = viewingProduct || (await productService.search({})).items[0];
        if (target) {
          addToCart(target);
          reply = `Bahut badhiya! "${target.title}" (₹${target.price}) cart me add ho gaya. Kya checkout karein?`;
        }
      }
    }
    // 4. Open Gullak Wallet
    else if (lower.includes('gullak') || lower.includes('wallet') || lower.includes('paise')) {
      router.push('/gullak');
      reply = 'Aapka Shopping Gullak Wallet khol diya hai. Yahan aap apne shopping ke paise alag safe rakh sakte hain!';
    }
    // 5. Smart Filter Search (Price + Color + Fabric + Category)
    else {
      const params = new URLSearchParams();
      const priceMatch = lower.match(/(\d{3,5})/);
      if (priceMatch) params.set('maxPrice', priceMatch[1]);
      if (lower.includes('blue') || lower.includes('neela')) params.set('color', 'blue');
      if (lower.includes('red') || lower.includes('laal')) params.set('color', 'red');
      if (lower.includes('green') || lower.includes('hara')) params.set('color', 'green');
      if (lower.includes('cotton') || lower.includes('coton')) params.set('fabric', 'cotton');
      if (lower.includes('silk')) params.set('fabric', 'silk');
      if (lower.includes('kurta')) params.set('category', 'kurtas');
      else if (lower.includes('kurti')) params.set('category', 'kurtis');
      else if (lower.includes('saree') || lower.includes('sadi')) params.set('category', 'sarees');
      else if (lower.includes('tv')) params.set('category', 'electronics');
      else if (!priceMatch) params.set('q', text);

      router.push(`/?${params.toString()}`);
      reply = `Ji bilkul! Aapke hisaab se best products screen par filter karke dikha diye hain. Koi pasand aaye to boliye "try karke dikhao" ya "cart me dalo"!`;
    }

    setMessages((m) => [...m, { role: 'dukaandar', text: reply }]);
    speak(reply);
  };

  const toggleMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setMessages((m) => [
        ...m,
        { role: 'dukaandar', text: 'Is browser me Mic support nahi hai—niche type ya quick buttons use karein!' },
      ]);
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRec();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      handleCommand(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  if (!voiceOpen) {
    return (
      <button
        onClick={() => setVoiceOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-3.5 text-sm font-bold text-white shadow-xl transition hover:scale-105"
      >
        <Mic className="h-5 w-5" />
        <span>Voice Dukaandar</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[92vw] max-w-md flex-col overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-orange-800 px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">BazaarSaathi Dukaandar</p>
            <p className="text-[11px] text-amber-200">
              {viewingProduct ? `Watching: ${viewingProduct.title.slice(0, 26)}...` : 'Hands-Free Voice Shopping'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSpeakEnabled(!speakEnabled)}
            title="Toggle Voice Speech"
            className={`rounded-lg p-1.5 ${speakEnabled ? 'bg-white/20' : 'opacity-50'}`}
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button onClick={() => setVoiceOpen(false)} className="rounded-lg p-1.5 hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-72 space-y-3 overflow-y-auto bg-amber-50/30 p-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'border border-amber-200 bg-white text-slate-800'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Voice Command Chips */}
      <div className="flex gap-1.5 overflow-x-auto border-t bg-white px-3 py-2">
        {[
          '1500 ke andar blue cotton kurta',
          'Ise try karke dikhao',
          'Cart me dalo',
          'Gullak kholo',
        ].map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleCommand(cmd)}
            className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-800 hover:bg-orange-100"
          >
            <Sparkles className="mr-1 inline h-3 w-3" />
            {cmd}
          </button>
        ))}
      </div>

      {/* Input + Mic */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommand(input);
        }}
        className="flex items-center gap-2 border-t bg-white p-3"
      >
        <button
          type="button"
          onClick={toggleMic}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
            listening
              ? 'animate-pulse bg-rose-600 text-white'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? 'Listening... Boliye!' : 'Boliye ya yahan likhein...'}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-orange-600"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}