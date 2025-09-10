import React, { useEffect } from 'react';
import {
  Page,
  InlineStack,
} from "@shopify/polaris";
import { PricingCard } from './componants/PricingCard';
import { authenticate, STANDERED_PLAN } from '../shopify.server';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getChargeByShop, insertCharge } from '../models/charges.server';
import { checkSubscriptionStatus, createAppMetafield, getAppId, requestSubscription } from '../models/Subscription.server';



export const loader = async ({ request }) => {
  const { session, billing, admin} = await authenticate.admin(request);
  const { shop } = session;

  const charge_id = request.url.split("charge_id=")[1];

  if (charge_id) {
    const currentSubscrption = await checkSubscriptionStatus(billing);
    const currentSubscriptionDB  = await getChargeByShop(shop);
    if (currentSubscrption.hasActivePayment && currentSubscriptionDB == null) {
      if(currentSubscriptionDB == null){
        let subscription = currentSubscrption.subscription;      
        const currentSubscription = await insertCharge(subscription, shop); 
        const appId = await getAppId(admin.graphql);
        const appMetafield = await createAppMetafield(admin.graphql, {
          namespace: "productDiscounts",
          key: "hasPlan",
          type: "boolean",
          value: "true",
          ownerId: appId,
        });  
        // console.log("appMetafield:", {appMetafield});
        return {currentSubscription};
      }else{
        return {currentSubscription: currentSubscriptionDB};
      }
    }
    return {currentSubscription: currentSubscriptionDB};
  }else{
    const currentSubscription  = await getChargeByShop(shop);
    return {currentSubscription};
  }
  
};

export const action = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const planTitle = formData.get("plan");  

  let plan = STANDERED_PLAN;
  //  console.log("Selected Plan:", planTitle);
  if (planTitle =="Standard") {
    plan = STANDERED_PLAN;
  }

  await requestSubscription(billing, plan, `https://admin.shopify.com/store/${shop.replace(".myshopify.com","")}/apps/discounts-products-page/app/pricing`, shop); 
  
  return null;
};

export default function Pricing(){
  
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading = ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";

  const handlePlanSelect = (plan) => fetcher.submit({ plan:plan }, { method: "post" });

  useEffect(() => {   
      //shopify.toast.show("Plan Subscribed Successfully");
  }, [shopify]);

  return (
    <Page 
      backAction={{content: 'Dashboard', url: '/app'}}
      title="Select a plan"
    >
        <InlineStack gap="600" align="start" blockAlign="start">
          <PricingCard
            active={loaderData.currentSubscription != null && loaderData.currentSubscription?.title === "Standered Subscription"}
            title="Standered"
            name="Monthly Subscription"
            description="This is a great plan for stores that are just starting out"
            features={[
              "Process up to 1,000 orders/mo",
              "Amazing feature",
              "Another really cool feature",
              "24/7 Customer Support",
            ]}
            price="$19"
            frequency="month"
            button={{
              content: "Select Plan",
              props: {
                disabled:isLoading,
                loading:isLoading,
                variant: "primary",
                onClick: () => handlePlanSelect("Standered Subscription"),
              },
            }}
          />
        </InlineStack>
    </Page>
  );
}


