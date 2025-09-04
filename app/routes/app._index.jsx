import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  BlockStack,
  Box,
  Card,
  Text,
  Select,
  DataTable,
  Button
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { checkSubscriptionStatus } from "../models/Subscription.server";
import { CalloutCard } from '@shopify/polaris';
import { useCallback, useState } from "react";
import { getDiscountsByShop } from "../models/Discounts.server";

export const loader = async ({ request }) => {
  const { session, billing, redirect, admin } = await authenticate.admin(request);
  const shop = session.shop;

  const latestDiscounts =  await getDiscountsByShop(shop);

  const responseTheme = await admin.graphql(
  `#graphql
    query {
      themes(first: 250) {
        edges {
          node {
            name
            id
            role
          }
        }
      }
    }`,
  );

  const themesData = await responseTheme.json();

  const themes = themesData.data?.themes.edges?.map((theme) => {
    return {label: theme.node.name, value: theme.node.id};
  });


  const responseProduct = await admin.graphql(
  `#graphql
    query {
      products(first: 1) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }`,
  );
  const productData = await responseProduct.json();
  const product = productData.data?.products.edges[0].node;

  const billingRequire = await checkSubscriptionStatus(billing, redirect);

  if(!billingRequire.hasActivePayment) {
    return redirect(`/app/pricing`);
  }
  
  return {shop, themes, product, latestDiscounts};
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);

  return null;
};

export default function Index() {

  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const loaderData = useLoaderData();
  const actionData = useActionData();

  const [selectedTheme, setSelectedTheme] = useState(loaderData?.themes?.length > 0 ? loaderData?.themes[0]?.value : null);

  const discounts = loaderData?.latestDiscounts.map((discount) => {
    let url = `https://admin.shopify.com/store/${loaderData.shop.replace('.myshopify.com','')}/discounts/${discount.discountGid.replace('gid://shopify/DiscountCodeNode/','')}`;
    return [discount.discountGid.replace("gid://shopify/DiscountCodeNode/",''), discount.title, discount.type, <Button url={url} target='_blank'>View</Button>];
  });

  
  return (
    <Page>      
      <BlockStack gap="500">

        <BlockStack gap="100">
          <Text variant="heading3xl" as="h2" alignment="center">
              Welcome
          </Text>

          <Text variant="bodyText" as="p" alignment="center">
              Show products with discounts on product pages.
          </Text>
        </BlockStack>

        <Card roundedAbove="sm">
            <Text as="h2" variant="headingSm">
                How to configure ?
            </Text>
            <Box paddingBlockStart="200">
                <Text as="p" variant="bodyMd">
                  1. Suibscribe to a plan.
                </Text>
                <Text as="p" variant="bodyMd">
                  2. Go to the theme customization.
                </Text>
                <Text as="p" variant="bodyMd">
                  3. Go to the product template.
                </Text>
                <Text as="p" variant="bodyMd">
                  4. Add block named <Text as="h" variant="headingMd">"Product Discount block"</Text>.
                </Text>
                <Text as="p" variant="bodyMd">
                  5. Change color and settings accordingly.
                </Text>
            </Box>
        </Card>

        <CalloutCard
            title="Configure discount block on product pages"
            illustration="./idea-svgrepo-com.svg"
            primaryAction={{
              content: 'Configure Now',
              target: '_blank',
              variant: 'primary',
              url: `https://admin.shopify.com/store/jaydeep-dev-store/themes/${selectedTheme.replace('gid://shopify/OnlineStoreTheme/', '')}/editor?previewPath=%2Fproducts%2F${loaderData?.product?.handle}`,
            }}
        >
          <BlockStack gap="500">
            <p>Easily set up and manage discount blocks on your product pages to highlight savings and encourage conversions. Customize the display, and ensure customers clearly see the offers available before adding items to their cart.</p>
            <Select
              label="Select Theme"
              options={loaderData.themes}
              onChange={(value) => setSelectedTheme(value)}
              value={selectedTheme}
              placeholder="Select Theme"
            />
          </BlockStack>
        </CalloutCard>

        <Card roundedAbove="sm">
            <Text as="h2" variant="headingSm">
                Latest Discounts
            </Text>
            <Box paddingBlockStart="200">
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text',
                    'text',
                    'text',
                  ]}
                  headings={[
                    'ID',
                    'Title',
                    'Type',
                    'Action',
                  ]}
                  rows={discounts}
                />
            </Box>
        </Card>

      </BlockStack>      
    </Page>
  );
}
