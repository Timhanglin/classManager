/**
 * src/api/base44Client.js
 * * 這是一個「模擬」的資料庫客戶端。
 * 它會攔截原本要發送給後端的請求，改為將資料儲存在您瀏覽器的 LocalStorage 中。
 * 這樣您就不需要連網，也不需要後端伺服器，就能在本機執行系統。
 */

// 模擬網路延遲 (讓感覺更像真實 App)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 通用的資料庫操作函數
const createMockEntity = (collectionKey) => {
  
  // 從 LocalStorage 讀取資料
  const getStore = () => {
    try {
      const data = localStorage.getItem(`app_${collectionKey}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('讀取資料失敗', e);
      return [];
    }
  };

  // 寫入資料到 LocalStorage
  const setStore = (data) => {
    try {
      localStorage.setItem(`app_${collectionKey}`, JSON.stringify(data));
    } catch (e) {
      console.error('寫入資料失敗', e);
    }
  };

  return {
    // 1. 列表查詢 (List)
    list: async (sort, limit) => {
      await delay(300); // 假裝讀取中
      let data = getStore();
      
      // 簡單的排序邏輯
      if (sort) {
        const isDesc = sort.startsWith('-');
        const field = sort.replace('-', '');
        data.sort((a, b) => {
          if (a[field] < b[field]) return isDesc ? 1 : -1;
          if (a[field] > b[field]) return isDesc ? -1 : 1;
          return 0;
        });
      }

      // 數量限制
      if (limit) {
        data = data.slice(0, limit);
      }
      
      return data;
    },

    // 2. 新增資料 (Create)
    create: async (data) => {
      await delay(300);
      const store = getStore();
      const newItem = {
        ...data,
        id: Math.random().toString(36).substr(2, 9), // 隨機產生 ID
        created_date: new Date().toISOString(),      // 自動加上建立時間
      };
      store.unshift(newItem); // 加到最前面
      setStore(store);
      return newItem;
    },

    // 3. 更新資料 (Update)
    update: async (id, data) => {
      await delay(300);
      const store = getStore();
      const index = store.findIndex((item) => item.id === id);
      if (index > -1) {
        const updatedItem = { ...store[index], ...data };
        store[index] = updatedItem;
        setStore(store);
        return updatedItem;
      }
      return null;
    },

    // 4. 刪除資料 (Delete)
    delete: async (id) => {
      await delay(300);
      let store = getStore();
      const newStore = store.filter((item) => item.id !== id);
      setStore(newStore);
      return { success: true };
    }
  };
};

// 匯出物件，這裡的名稱必須對應您原始碼中的 import
export const base44 = {
  entities: {
    // 對應 StudentManagement.txt 裡的 base44.entities.Student
    Student: createMockEntity('students'),
    
    // 對應 CourseManagement.txt 裡的 base44.entities.Course
    Course: createMockEntity('courses'),
    
    // 對應 Overview.txt 和 CourseCalendar.txt 裡的 base44.entities.ScheduleEvent
    ScheduleEvent: createMockEntity('events'),
  },
  
  // 為了防止上傳圖片功能報錯，做一個假的圖片上傳
  storage: {
    upload: async (file) => {
      await delay(500);
      // 這裡沒辦法真的存圖片，只能回傳一個假的網址或本地暫存網址
      return { url: URL.createObjectURL(file) };
    }
  }
};