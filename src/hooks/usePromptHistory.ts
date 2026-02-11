import { useState, useEffect } from "react";

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  style: string;
  timestamp: Date;
  isFavorite: boolean;
  imageUrl?: string;
}

const STORAGE_KEY = "asuran-prompt-history";

export const usePromptHistory = () => {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const withDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(withDates);
      } catch (e) {
        console.error("Failed to parse prompt history:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (prompt: string, style: string, imageUrl?: string) => {
    const newItem: PromptHistoryItem = {
      id: Date.now().toString(),
      prompt,
      style,
      timestamp: new Date(),
      isFavorite: false,
      imageUrl,
    };

    setHistory((prev) => [newItem, ...prev]);
    return newItem;
  };

  const toggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory((prev) => prev.filter((item) => item.isFavorite));
  };

  const favorites = history.filter((item) => item.isFavorite);
  const recentHistory = history.filter((item) => !item.isFavorite);

  return {
    history,
    favorites,
    recentHistory,
    addToHistory,
    toggleFavorite,
    removeFromHistory,
    clearHistory,
  };
};
