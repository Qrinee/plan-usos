'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, BookOpen, ExternalLink, Copy, Check } from 'lucide-react';
import { CourseSearchResult } from '@/lib/usos/types';

interface CourseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CourseSearchModal: React.FC<CourseSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<CourseSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/usos/courses?query=${encodeURIComponent(searchTerm.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
        }
      } catch (err) {
        console.error('Course search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl apple-card rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        <div className="p-4 sm:p-5 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#fa243c] to-[#fb5c74] text-white flex items-center justify-center shadow-md shadow-[#fa243c]/20">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                Katalog Przedmiotów PRZ
              </h3>
              <p className="text-xs text-[#86868b]">
                Wyszukaj przedmioty w oficjalnej bazie USOS Politechniki Rzeszowskiej
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Wpisz nazwę przedmiotu (np. Bazy danych, Matematyka)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:bg-white dark:focus:bg-[#1c1c1e] focus:ring-2 focus:ring-[#fa243c]/30 transition-all duration-300"
              autoFocus
            />
            {loading && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#fa243c] animate-spin" />
            )}
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {searchTerm.length < 2 ? (
            <div className="py-12 text-center text-[#86868b] text-xs">
              Wpisz co najmniej 2 znaki, aby rozpocząć wyszukiwanie.
            </div>
          ) : loading && results.length === 0 ? (
            <div className="py-12 text-center text-[#86868b] text-xs">
              Przeszukiwanie bazy USOS Politechniki Rzeszowskiej...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[#86868b] text-xs">
              Nie znaleziono przedmiotów pasujących do &ldquo;{searchTerm}&rdquo;.
            </div>
          ) : (
            results.map((item) => {
              const name = item.match || item.course_id;
              const isCopied = copiedId === item.course_id;

              return (
                <div
                  key={item.course_id}
                  className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.05] transition-all duration-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-[#fa243c]/10 text-[#fa243c] flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-mono text-[#86868b] bg-black/[0.04] dark:bg-white/[0.08] px-2 py-0.5 rounded-full">
                          {item.course_id}
                        </span>
                        <button
                          onClick={() => handleCopy(item.course_id)}
                          className="text-[10px] text-[#fa243c] hover:underline flex items-center space-x-0.5 font-medium cursor-pointer"
                          title="Kopiuj kod przedmiotu"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-[#34c759]" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Skopiowano' : 'Kopiuj kod'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://usosweb.prz.edu.pl/kontroler.php?_action=katalog2/przedmioty/pokazPrzedmiot&prz_kod=${encodeURIComponent(
                      item.course_id
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.1] text-[#86868b] hover:text-[#fa243c] transition-colors shrink-0"
                    title="Otwórz kartę przedmiotu w USOSweb"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868b] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5">
          <span>Znaleziono {results.length} wyników</span>
          <button
            onClick={onClose}
            className="px-4 py-2 min-h-[36px] rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-xs font-medium text-white shadow-sm shadow-[#fa243c]/20 transition-all active:scale-95 cursor-pointer"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
};
