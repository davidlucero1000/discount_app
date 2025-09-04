import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getDiscountByCollectionId, getDiscountByProductId, getDiscountByVarisntId } from "../models/Discounts.server";
import { cors } from "remix-utils/cors";


export const action = async ({ request }) => {
    const { storefront, session } = await authenticate.public.appProxy(request);
   
    if(session){
       try {
            let body = await request.json();
            let { productId, variantId, collections } = body;

            if(collections.indexOf(',') > -1){
                collections = collections.split(',');
            }

            let discounts = [];

            if(collections && collections.length > 0) {
                for (let collectionId of collections) {
                    let discount = await getDiscountByCollectionId(
                        session.shop,
                        collectionId.trim()
                    );                   
                    if (discount.length > 0) {
                        discounts.push(discount);
                    }
                }
                
            }else{
                let discount = await getDiscountByCollectionId(
                    session.shop,
                    collections
                );
                if (discount.length > 0) {
                    discounts.push(discount);
                }
            }



            if(productId != ""){
                let discount = await getDiscountByProductId(
                    session.shop,
                    productId
                );
                if (discount.length > 0) {
                    discounts.push(discount);
                }
            }

            if(variantId != ""){
                let discount = await getDiscountByVarisntId(
                    session.shop,
                    variantId
                );
                if (discount.length > 0) {
                    discounts.push(discount);
                }
            }

            if(discounts.length > 0){
                discounts = discounts.flat();
                // console.log("All discounts flat:", discounts);
                discounts = [...new Map(discounts.map(discount => [discount.id, discount])).values()];
                return cors(request, json({ discounts }, { status: 200 }));
            }else{
                return cors(request, json({ discounts }, { status: 200 }));
            }            

        } catch (error) {   
            console.error("Error fetching discounts:", error.message);  
            return cors(request, json({ message: JSON.stringify(error.body?.errors) }, { status: error.status || 500 }));
        }
    }
    return cors(request, json({ message: "Un-Authorized Access !!" }, { status: 401 }));
}


