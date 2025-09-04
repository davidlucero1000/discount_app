import { authenticate } from "../shopify.server";
import db from "../db.server";
import { deleteDiscount, getDiscountById } from "../models/Discounts.server";

export const action = async ({ request }) => {
  const { payload, session, topic, shop, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;

  if (session) {
    let id = payload.admin_graphql_api_id;
    let discount = await getDiscountById(shop, id);
    if(discount){
      await deleteDiscount(discount.id);
    }
  }

  return new Response();
};
