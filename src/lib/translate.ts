// Auto-translate Chinese prompts to English for AI models
// Uses Google's free translation endpoint (no API key needed)

const INTERIOR_DESIGN_DICT: Record<string, string> = {
  // Room types
  "客廳": "living room", "臥室": "bedroom", "主臥": "master bedroom",
  "廚房": "kitchen", "浴室": "bathroom", "書房": "study room",
  "餐廳": "dining room", "玄關": "entrance hall", "陽台": "balcony",
  "走廊": "hallway", "更衣室": "walk-in closet", "儲藏室": "storage room",
  "辦公室": "office", "會議室": "meeting room", "大廳": "lobby",
  "商業空間": "commercial space", "展示間": "showroom",
  // Styles
  "現代極簡": "modern minimalist", "侘寂": "wabi-sabi",
  "工業風": "industrial style", "北歐風": "Scandinavian style",
  "日式禪風": "Japanese zen", "裝飾藝術": "Art Deco",
  "中世紀現代": "mid-century modern", "當代奢華": "contemporary luxury",
  "新古典": "neoclassical", "鄉村風": "rustic country",
  "美式風格": "American style", "法式風格": "French style",
  "地中海風": "Mediterranean style", "波西米亞": "bohemian",
  "極簡": "minimalist", "奢華": "luxury", "輕奢": "light luxury",
  // Materials
  "大理石": "marble", "木材": "wood", "木質": "wooden",
  "不鏽鋼": "stainless steel", "玻璃": "glass", "石材": "stone",
  "磁磚": "ceramic tile", "瓷磚": "porcelain tile",
  "水泥": "concrete", "清水模": "fair-faced concrete",
  "皮革": "leather", "布藝": "fabric", "金屬": "metal",
  "銅": "copper", "黃銅": "brass", "藤": "rattan",
  "竹": "bamboo", "磚": "brick", "花崗岩": "granite",
  // Colors
  "白色": "white", "黑色": "black", "灰色": "gray",
  "米色": "beige", "棕色": "brown", "原木色": "natural wood",
  "香檳金": "champagne gold", "深藍": "navy blue",
  "墨綠": "dark green", "暖色": "warm tones", "冷色": "cool tones",
  // Descriptors
  "明亮": "bright", "寬敞": "spacious", "溫馨": "cozy",
  "通透": "airy", "開放式": "open plan", "挑高": "high ceiling",
  "採光": "natural lighting", "落地窗": "floor-to-ceiling windows",
  "中島": "kitchen island", "吧台": "bar counter",
  "電視牆": "TV wall", "沙發": "sofa", "窗簾": "curtains",
  "天花板": "ceiling", "地板": "floor", "牆面": "wall",
  "樓梯": "staircase", "壁爐": "fireplace",
};

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function quickDictTranslate(text: string): string {
  let result = text;
  // Sort by length descending so longer phrases match first
  const entries = Object.entries(INTERIOR_DESIGN_DICT)
    .sort((a, b) => b[0].length - a[0].length);
  for (const [zh, en] of entries) {
    result = result.replaceAll(zh, en);
  }
  return result;
}

async function googleTranslate(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // Response format: [[["translated text","original text",...],...],...]
    const translated = data[0]?.map((seg: string[]) => seg[0]).join("") || text;
    return translated;
  } catch {
    // Fallback: return dict-translated version
    return quickDictTranslate(text);
  }
}

export async function translatePrompt(prompt: string): Promise<string> {
  if (!containsChinese(prompt)) return prompt;

  // First pass: replace known interior design terms
  const dictResult = quickDictTranslate(prompt);

  // If no Chinese remains after dict, we're done
  if (!containsChinese(dictResult)) return dictResult;

  // Second pass: translate remaining Chinese via Google
  return googleTranslate(prompt);
}
