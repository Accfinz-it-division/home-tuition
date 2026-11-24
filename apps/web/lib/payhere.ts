import crypto from "crypto";

// PayHere Merchant Credentials (from .env)
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID!;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET!;
const IS_SANDBOX = process.env.PAYHERE_MODE === "sandbox";

// Generate hash for payment (backend only)
export function generatePaymentHash(
  orderId: string,
  amount: number,
  currency: string = "LKR"
): string {
  // Format amount to 2 decimal places
  const amountFormatted = amount.toFixed(2);
  
  // Step 1: MD5 hash of merchant secret, then uppercase
  const hashedSecret = crypto
    .createHash("md5")
    .update(MERCHANT_SECRET)
    .digest("hex")
    .toUpperCase();
  
  // Step 2: Concatenate merchant_id + order_id + amount + currency + hashedSecret
  const hashString = MERCHANT_ID + orderId + amountFormatted + currency + hashedSecret;
  
  // Step 3: MD5 hash of the concatenated string, then uppercase
  const hash = crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();
  
  return hash;
}

// Verify PayHere webhook signature (md5sig)
export function verifyPaymentSignature(params: {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}): boolean {
  const hashedSecret = crypto
    .createHash("md5")
    .update(MERCHANT_SECRET)
    .digest("hex")
    .toUpperCase();
  
  const localString =
    params.merchant_id +
    params.order_id +
    params.payhere_amount +
    params.payhere_currency +
    params.status_code +
    hashedSecret;
  
  const localMd5sig = crypto
    .createHash("md5")
    .update(localString)
    .digest("hex")
    .toUpperCase();
  
  return localMd5sig === params.md5sig;
}

// Export PayHere config
export const PAYHERE_CONFIG = {
  merchantId: MERCHANT_ID,
  sandbox: IS_SANDBOX,
};