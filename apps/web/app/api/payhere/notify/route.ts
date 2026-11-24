import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/payhere";

export async function POST(req: Request) {
  try {
    // PayHere sends x-www-form-urlencoded data, not JSON
    const formData = await req.formData();
    
    const merchant_id = formData.get("merchant_id") as string;
    const order_id = formData.get("order_id") as string;
    const payhere_amount = formData.get("payhere_amount") as string;
    const payhere_currency = formData.get("payhere_currency") as string;
    const status_code = formData.get("status_code") as string;
    const md5sig = formData.get("md5sig") as string;

    console.log("📥 PayHere notification:", {
      order_id,
      payhere_amount,
      status_code,
    });

    // Step 1: Verify signature (SECURITY)
    const isValid = verifyPaymentSignature({
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    });

    if (!isValid) {
      console.error("❌ Invalid signature for order:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Step 2: Find payment by gatewayRef (order_id)
    const payment = await prisma.payment.findFirst({
      where: { gatewayRef: order_id },
    });

    if (!payment) {
      console.error("❌ Payment not found:", order_id);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Step 3: Update based on status_code
    // 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
    let newStatus: "PAID" | "FAILED" | "PENDING" = "PENDING";
    
    if (status_code === "2") {
      newStatus = "PAID";
    } else if (status_code === "-1" || status_code === "-2" || status_code === "-3") {
      newStatus = "FAILED";
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });

    console.log(`✅ Payment ${order_id} updated to ${newStatus}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ PayHere notify error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}