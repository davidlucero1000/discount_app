import { authenticate } from "../shopify.server";
import db from "../db.server";
import { updateCharge } from "../models/charges.server";

export const action = async ({ request }) => {
  const { shop, session, topic, billing } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    // Get charges from db
    const charges = await db.charges.findFirst({
      where: { shop: shop, cancledAt: null, status: "ACTIVE" }
    });
    // Update sybscription for shop    
    await billing.cancel({
      subscriptionId: charges.chargeId,
      isTest: true,
      prorate: true,
    });
    // Update sybscription for db  
    await updateCharge(charges);
    console.log(`Updated subscription for ${shop} to CANCELED`);
    // Delete the session for the shop    
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};

