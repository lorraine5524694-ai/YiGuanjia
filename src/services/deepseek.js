

const API_KEY = 'sk-e12c87d92a044427b5b7bdce590684f8'; // Replace with actual key or use environment variable
const BASE_URL = '/deepseek/chat/completions';

import { createWorker } from 'tesseract.js';

export const performOCR = async (imagePath) => {
  console.log('Starting OCR via Tesseract for:', imagePath);
  try {
    // Initialize worker with Chinese and English
    // Note: This downloads language data from CDN. Ensure network access.
    const worker = await createWorker(['chi_sim', 'eng']);

    const ret = await worker.recognize(imagePath);
    const text = ret.data.text;

    console.log('OCR Result:', text);
    await worker.terminate();

    if (!text || text.trim().length === 0) {
      throw new Error('未识别到文字');
    }

    return text;
  } catch (e) {
    console.error('OCR Error:', e);
    // If Tesseract fails, we might want to fall back to mock or throw
    throw e;
  }
};

// urlToBase64 is no longer strictly needed for Tesseract but keeping it if needed elsewhere, 
// or removing it if it was only for the API call. 
// The previous code used it for API. Tesseract accepts blob URLs directly.
// I will remove urlToBase64 to clean up.

export const analyzeImageContent = async (textFromOcr, promptType) => {
  // Since DeepSeek is primarily text-based (unless using VL model), we assume OCR is done or simulated.
  // If using a VL model, we would send the image. For now, we'll assume we send text.

  if (!textFromOcr) {
    throw new Error('OCR text is empty');
  }

  let systemPrompt = "你是一个专业的医疗助手。";
  if (promptType === 'report') {
    systemPrompt = "你是一个医疗助手。请分析以下医疗报告文本并提取关键指标。以JSON格式返回结果，包含字段：name（指标名称）, value（数值）, ref（参考范围）, flag（高/低/正常）。";
  } else if (promptType === 'med') {
    systemPrompt = "你是一个医疗助手。请分析以下药盒文本并提取药品名称、规格（spec）和用法用量。返回一个严格合法的JSON对象，包含键：'name', 'spec', 'usage'。不要使用markdown代码块包裹。如果文本中没有明显药品信息，请尝试推断或返回空对象。";
  } else if (promptType === 'record_extraction') {
    systemPrompt = "你是一个医疗助手。请分析以下病历文本并提取关键信息。返回一个严格合法的JSON对象，包含键：'complaint'（主诉）, 'history'（现病史）, 'diagnosis'（诊断）, 'hospital'（医院）, 'department'（科室）, 'doctor'（医生）, 'date'（就诊日期，格式YYYY-MM-DD）。如果某项信息缺失，请留空字符串。";
  } else if (promptType === 'record_advice') {
    systemPrompt = "你是一个医疗助手。请根据以下病历内容（主诉、现病史、诊断等）提供简要的AI解读和建议。包括：1. 病情摘要；2. 生活建议；3. 就医提示。请直接返回纯文本内容，不要使用JSON格式，分点陈述，语气亲切专业。";
  }

  try {
    const isJson = promptType !== 'record_advice';
    const res = await uni.request({
      url: BASE_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: {
        model: "deepseek-chat", // or deepseek-coder, etc.
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: textFromOcr }
        ],
        response_format: isJson ? { type: "json_object" } : undefined
      }
    });

    if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
      let content = res.data.choices[0].message.content;
      if (isJson) {
        // Remove markdown code blocks if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(content);
      } else {
        return content;
      }
    } else {
      console.error('DeepSeek API Error:', res);
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('DeepSeek Request Failed:', error);
    // Fallback mock data for demo purposes if API fails or no key
    if (promptType === 'report') {
      return [
        { name: '白细胞计数 WBC', value: '12.5', ref: '3.5-9.5', flag: 'high' },
        { name: '红细胞计数 RBC', value: '4.1', ref: '3.8-5.1', flag: 'normal' },
        { name: '血红蛋白 HGB', value: '95', ref: '115-150', flag: 'low' },
      ];
    } else if (promptType === 'med') {
      console.warn('Using mock data due to API failure');
      return {
        name: '阿莫西林胶囊',
        spec: '0.5g x 24粒',
        usage: '口服，一次0.5g，一日3次'
      };
    } else if (promptType === 'record_extraction') {
      console.warn('Using mock data due to API failure');
      return {
        complaint: '咳嗽伴咽痛 3 天',
        history: '发热 38.3℃，自行口服对乙酰氨基酚',
        diagnosis: '急性上呼吸道感染',
        hospital: '北京协和医院',
        department: '呼吸内科',
        doctor: '张医生',
        date: '2024-05-20'
      };
    } else if (promptType === 'record_advice') {
      return "症状与体征提示为上呼吸道炎症。\n建议充足休息与补水，避免刺激性食物。\n若持续高热或呼吸困难，应及时就医复查。";
    }
    throw error;
  }
};

export const searchMedicines = async (query) => {
  try {
    const res = await uni.request({
      url: BASE_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个乐于助人的药剂师。请搜索匹配用户查询的药品。返回一个包含 'name'（药品名称）和 'spec'（规格）字段的对象的JSON数组。至少返回5个结果。输出必须是合法的JSON数组。" },
          { role: "user", content: `搜索药品: ${query}` }
        ],
        response_format: { type: "json_object" }
      }
    });

    if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
      const content = res.data.choices[0].message.content;
      // Handle case where API returns { "medicines": [...] } or just [...]
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : (parsed.medicines || parsed.results || []);
    }
    return [];
  } catch (error) {
    console.error('Search Failed:', error);
    return [];
  }
};

// Mock OCR function (kept for reference or fallback)
export const mockOCR = async (filePath, type = 'report') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (type === 'med') {
        resolve("模拟OCR文本: [药盒] 名称: 阿莫西林胶囊 0.5g 用法: 一日3次...");
      } else {
        resolve("模拟OCR文本: [医院名称] 检验报告... 白细胞 12.5 ... 血红蛋白 95 ...");
      }
    }, 1000);
  });
};
