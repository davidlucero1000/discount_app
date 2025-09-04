import { STANDERED_PLAN } from "../shopify.server";
import { getChargeByShop, updateCharge } from "./charges.server";

export async function checkSubscriptionStatus(billing) {
    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [STANDERED_PLAN],
        isTest: true,
    });
     
    return {
        hasActivePayment: hasActivePayment,
        subscription: appSubscriptions.length > 0 ? appSubscriptions[0] : null,
    };
}

export async function requireSubscription(billing, redirect) {
    return await billing.require({
        plans: [STANDERED_PLAN],
        isTest: true,
        onFailure: () => redirect(`/app/pricing`),
    });
}

export async function requestSubscription(billing, plan, returnUrl, shop) {
    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [STANDERED_PLAN],
        isTest: true,
    });

    if (hasActivePayment) {
        let subscription = appSubscriptions[0];
        await billing.cancel({
            subscriptionId: subscription.id,
            isTest: true,
            prorate: true,
        });
        const currentSubscriptionDB = await getChargeByShop(shop);
        await updateCharge(currentSubscriptionDB);
    }

    return await billing.request({
        plan: plan,
        isTest: true,
        returnUrl: returnUrl
    });
}


export async function getSubscriptionStatus(graphql) {
  const result = await graphql(
    `
      #graphql
      query Shop {
        app {
          installation {
            launchUrl
            activeSubscriptions {
              id
              name
              createdAt
              returnUrl
              status
              currentPeriodEnd
              trialDays
            }
          }
        }
      }
    `,
    { variables: {} },
  );

  const res = await result.json();
  return res;
}


export async function getAppId(graphql) {
  const appIdQuery = await graphql(`
    #graphql
    query {
      currentAppInstallation {
        id
      }
    }
  `);

  const appIdQueryData = await appIdQuery.json();
  const appInstallationID = appIdQueryData.data.currentAppInstallation.id;
  return appInstallationID;
}

export async function createAppMetafield(graphql, metafields) {

  const appMetafield = await graphql(
    `
      #graphql
      mutation CreateAppDataMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
            type
            ownerType
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: metafields,
      },
    },
  );

  const data = await appMetafield.json();
  return data.data.metafieldsSet.metafields[0];
}

export async function getAppMetafield(graphql) {
  const response = await graphql(
    `#graphql
    query {
      metafieldDefinitions(
        ownerType: API_PERMISSION
        first: 10
        namespace: "productDiscounts"
      ) {
        edges {
          cursor
          node {
            id
            key
            name
            namespace
            metafields(first: 10) {
              edges {
                cursor
                node {
                  key
                  id
                  namespace
                  ownerType
                  type
                  value
                }
              }
            }
          }
        }
      }
    }`
  );
  return await response.json();
}
