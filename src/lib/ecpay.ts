import crypto from "crypto";

// ECPay AIO (All-in-One) Payment Integration
// Test: https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
// Prod: https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5

const ECPAY_CONFIG = {
  merchantID: process.env.ECPAY_MERCHANT_ID || "3002607",
  hashKey: process.env.ECPAY_HASH_KEY || "pwFHCqoQZGmho4w6",
  hashIV: process.env.ECPAY_HASH_IV || "EkRm7iFT261dpevs",
  paymentURL:
    process.env.ECPAY_PAYMENT_URL ||
    "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",
};

// ECPay URL encode spec: same as .NET System.Web.HttpUtility.UrlEncode
// lowercase hex, space → +, then specific char replacements
function ecpayUrlEncode(str: string): string {
  let encoded = encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2a")
    .replace(/%2d/gi, "-")
    .replace(/%5f/gi, "_")
    .replace(/%2e/gi, ".");
  // ECPay requires lowercase percent-encoding
  encoded = encoded.replace(/%([0-9A-F]{2})/g, (_, hex) => `%${hex.toLowerCase()}`);
  return encoded;
}

export function generateCheckMacValue(params: Record<string, string>): string {
  // 1. Sort params alphabetically by key
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  // 2. Prepend HashKey, append HashIV
  const raw = `HashKey=${ECPAY_CONFIG.hashKey}&${sorted}&HashIV=${ECPAY_CONFIG.hashIV}`;

  // 3. URL encode (lowercase)
  const urlEncoded = ecpayUrlEncode(raw).toLowerCase();

  // 4. SHA256 → uppercase
  return crypto.createHash("sha256").update(urlEncoded).digest("hex").toUpperCase();
}

export function verifyCheckMacValue(params: Record<string, string>): boolean {
  const receivedMac = params.CheckMacValue;
  if (!receivedMac) return false;

  const paramsWithoutMac = { ...params };
  delete paramsWithoutMac.CheckMacValue;

  const calculated = generateCheckMacValue(paramsWithoutMac);
  return calculated === receivedMac;
}

interface CreateOrderParams {
  tradeNo: string;
  totalAmount: number;
  tradeDesc: string;
  itemName: string;
  returnURL: string;
  clientBackURL: string;
  customField1?: string;
}

export function buildCheckoutFormData(order: CreateOrderParams): Record<string, string> {
  const now = new Date();
  const tradeDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  const params: Record<string, string> = {
    MerchantID: ECPAY_CONFIG.merchantID,
    MerchantTradeNo: order.tradeNo,
    MerchantTradeDate: tradeDate,
    PaymentType: "aio",
    TotalAmount: String(Math.round(order.totalAmount)),
    TradeDesc: order.tradeDesc,
    ItemName: order.itemName,
    ReturnURL: order.returnURL,
    ClientBackURL: order.clientBackURL,
    ChoosePayment: "ALL",
    EncryptType: "1",
  };

  if (order.customField1) {
    params.CustomField1 = order.customField1;
  }

  params.CheckMacValue = generateCheckMacValue(params);

  return params;
}

export function getPaymentURL(): string {
  return ECPAY_CONFIG.paymentURL;
}
