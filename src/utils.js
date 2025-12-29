/**
 * src/utils.js
 * 這是全站通用的工具函數
 */

// 1. 產生頁面連結的工具
export const createPageUrl = (pageName) => {
  if (pageName === 'Overview') return '/Overview';
  return `/${pageName}`;
};

// 2. 處理 CSS 類別合併 (給 Shadcn UI 用)
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}