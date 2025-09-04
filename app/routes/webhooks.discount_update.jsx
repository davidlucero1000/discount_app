import { authenticate } from "../shopify.server";
import { createDiscount, deleteDiscount, getDiscountById } from "../models/Discounts.server";

export const action = async ({ request }) => {
  const { payload, session, topic, shop, admin } = await authenticate.webhook(request);

  
    if (session) {   
            
      let id = payload.admin_graphql_api_id;

      // console.log("Updating discount with ID:", id);
  
      if (!id) {
        return new Response();
      }

      let dbdiscount = await getDiscountById(shop, id);
      
      if(dbdiscount){
        await deleteDiscount(dbdiscount.id);
    
        // Manual Basic Discount    
        const manualBasicDiscoutResponse = await admin.graphql(
          `#graphql
        query GetBasicDiscountById($id: ID!) {
          discountNode(id: $id) {
            id
            discount {
              ... on DiscountCodeBasic {
                endsAt
                recurringCycleLimit
                title
                status
                startsAt
                usageLimit
                appliesOncePerCustomer
                codes(first: 10) {
                  edges {
                    node {
                      code
                      id
                    }
                  }
                }
                minimumRequirement {
                  ... on DiscountMinimumQuantity {
                    __typename
                    greaterThanOrEqualToQuantity
                  }
                  ... on DiscountMinimumSubtotal {
                    __typename
                    greaterThanOrEqualToSubtotal {
                      amount
                      currencyCode
                    }
                  }
                }
                customerSelection {
                  ... on DiscountCustomerAll {
                    __typename
                    allCustomers
                  }
                  ... on DiscountCustomerSegments {
                    __typename
                    segments {
                      id
                      name
                    }
                  }
                  ... on DiscountCustomers {
                    __typename
                    customers {
                      id
                      displayName
                    }
                  }
                }
                customerGets {
                  appliesOnOneTimePurchase
                  appliesOnSubscription
                  value {
                    ... on DiscountAmount {
                      __typename
                      appliesOnEachItem
                      amount {
                        amount
                        currencyCode
                      }
                    }
                    ... on DiscountOnQuantity {
                      __typename
                      effect {
                        ... on DiscountAmount {
                          __typename
                          appliesOnEachItem
                          amount {
                            amount
                            currencyCode
                          }
                        }
                      }
                      quantity {
                        quantity
                      }
                    }
                    ... on DiscountPercentage {
                      __typename
                      percentage
                    }
                  }
                  items {
                    ... on AllDiscountItems {
                      __typename
                      allItems
                    }
                    ... on DiscountCollections {
                      __typename
                      collections(first: 250) {
                        edges {
                          node {
                            id
                            title
                            handle
                          }
                        }
                        pageInfo{
                          endCursor
                          hasNextPage
                        }
                      }
                    }
                    ... on DiscountProducts {
                      __typename
                      products(first: 250) {
                        edges {                      
                          node {
                            id
                            title
                            status
                            handle
                            variants(first: 100) {
                              edges {                            
                                node {
                                  id
                                  title
                                  price
                                  sku
                                }
                              }
                              pageInfo{
                                endCursor
                                hasNextPage
                              }
                            }
                            featuredMedia {
                              preview {
                                image {
                                  url
                                }
                              }
                            }
                          }
                        }
                        pageInfo{
                          endCursor
                          hasNextPage
                        }
                      }
                      productVariants(first: 250) {
                        edges {
                          node {
                            id
                            price
                            title
                            sku
                            product {
                              id
                              status
                              title
                              handle
                              featuredMedia {
                                preview {
                                  image {
                                    url
                                  }
                                }
                              }
                            }
                          }
                        }
                        pageInfo{
                          endCursor
                          hasNextPage
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          }`,
          {
            variables: { id },
          }      
        );

        const manualBasicDiscoutResponseResult = await manualBasicDiscoutResponse.json();
            
        if(manualBasicDiscoutResponseResult.data.errors){
          console.error("Error fetching discount:", manualBasicDiscoutResponseResult.data.errors);
          return new Response();
        }

        let manualBasicDiscoutData = manualBasicDiscoutResponseResult.data.discountNode.discount;
        let discount = {};


        if (manualBasicDiscoutData.title) {

            discount = {
              type: "ManualDiscountCodeBasic",
              id: id,
              status: manualBasicDiscoutData.status,
              title: manualBasicDiscoutData?.title,
              endsAt: manualBasicDiscoutData?.endsAt,
              startsAt: manualBasicDiscoutData?.startsAt,
              recurringCycleLimit: manualBasicDiscoutData?.recurringCycleLimit,
              usageLimit: manualBasicDiscoutData?.usageLimit,
              appliesOncePerCustomer: manualBasicDiscoutData?.appliesOncePerCustomer,
              minimumRequirements: {
                greaterThanOrEqualToQuantity: manualBasicDiscoutData?.minimumRequirement?.greaterThanOrEqualToQuantity || null,
                greaterThanOrEqualToSubtotal: {
                  amount: manualBasicDiscoutData?.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount || null,
                  currencyCode: manualBasicDiscoutData?.minimumRequirement?.greaterThanOrEqualToSubtotal?.currencyCode || null
                }
              },
              code: manualBasicDiscoutData?.codes.edges[0].node.code,
              customerSelection:{
                allCustomers: manualBasicDiscoutData?.customerSelection?.allCustomers || false,
                segments: manualBasicDiscoutData?.customerSelection?.segments || null,
                customers: manualBasicDiscoutData?.customerSelection?.customers || null
              },
              customerGets: {
                appliesOnOneTimePurchase: manualBasicDiscoutData?.customerGets?.appliesOnOneTimePurchase || false,
                appliesOnSubscription: manualBasicDiscoutData?.customerGets?.appliesOnSubscription || false,
                value: {
                  appliesOnEachItem: manualBasicDiscoutData?.customerGets?.value?.appliesOnEachItem || false,
                  DiscountAmount: {
                    amount: manualBasicDiscoutData?.customerGets?.value?.amount?.amount || null,
                    currencyCode: manualBasicDiscoutData?.customerGets?.value?.amount?.currencyCode || null
                  },
                  DiscountOnQuantity: {
                    DiscountAmount: {
                      amount: manualBasicDiscoutData?.customerGets?.value?.effect?.DiscountAmount?.appliesOnEachItem?.amount?.amount || null,
                      currencyCode: manualBasicDiscoutData?.customerGets?.value?.DiscountOnQuantity?.effect?.DiscountAmount?.appliesOnEachItem?.amount?.currencyCode || null
                    },
                    DiscountPercentage: {
                      percentage: manualBasicDiscoutData?.customerGets?.value?.effect?.DiscountPercentage?.percentage || null
                    },
                    quantity: {
                      quantity: manualBasicDiscoutData?.customerGets?.value?.DiscountOnQuantity?.quantity?.quantity || null
                    }
                  },
                  percentage: manualBasicDiscoutData?.customerGets?.value?.percentage || 0
                },
                items: {
                  allItems: manualBasicDiscoutData?.customerGets?.items?.DiscountItemsAll?.allItems || false,
                  collections: manualBasicDiscoutData?.customerGets?.items?.collections?.edges || null,
                  products: manualBasicDiscoutData?.customerGets?.items?.products?.edges || null,
                  productVariants: manualBasicDiscoutData?.customerGets?.items?.productVariants?.edges || null
                }
              }
            };

            let dbData = {
              type: discount.type,          
              title: discount?.title,
              endsAt: discount?.endsAt,
              startsAt: discount?.startsAt,
              discountGid: discount?.id,
              shop: shop,
              status: discount?.status,
              minimumRequirement : discount?.minimumRequirements,
              customerSelection: discount?.customerSelection,
              customerBuys: discount?.customerBuys,
              customerGets: discount?.customerGets,
              collectionAllProducts: discount.customerGets.items.allItems
            };

            let productIds = [];
            let variantIds = [];
            let collectionIds = []; 

            if(discount.customerGets.items.productVariants != null ){
              discount.customerGets.items.productVariants?.forEach((variant) => {           
                variantIds.push(variant.node.id);
                productIds.push(variant.node.product.id);
              });
            }

            if(discount.customerGets.items.products != null ){
              discount.customerGets.items.products?.forEach((product) => {           
                productIds.push(product.node.id);
                product.node.variants.edges.forEach((variant) => {
                  variantIds.push(variant.node.id);
                });
              });
            }

            if(discount.customerGets.items.collections != null ){   
              discount.customerGets.items.collections?.forEach((collection) => {           
                collectionIds.push(collection.node.id);           
              });
            }

            productIds = [...new Set(productIds)];
            variantIds = [...new Set(variantIds)];
            collectionIds = [...new Set(collectionIds)];

            dbData.productIds = productIds?.length > 0 ? productIds.join(',') : null;
            dbData.variantIds = variantIds?.length > 0 ? variantIds.join(',') : null;
            dbData.collectionIds = collectionIds?.length > 0 ? collectionIds.join(',') : null;

            //console.log("DB Data:", dbData);

            // Save the discount to the database
            let exists = await getDiscountById(shop, dbData.discountGid);
            if(exists == null || exists == undefined){
              await createDiscount(dbData);
            }


        }else{

          // Automatic Basic Discount
          const AutomaticBasicDiscountResponse = await admin.graphql(
            `#graphql
              query GetAutomaticBasicDiscountById($id: ID!) {
                discountNode(id: $id) {
                  id
                  discount {
                    ... on DiscountAutomaticBasic {
                      endsAt
                      title
                      status
                      startsAt
                      minimumRequirement {
                        ... on DiscountMinimumQuantity {
                          __typename
                          greaterThanOrEqualToQuantity
                        }
                        ... on DiscountMinimumSubtotal {
                          __typename
                          greaterThanOrEqualToSubtotal {
                            amount
                            currencyCode
                          }
                        }
                      }
                      customerGets {
                        appliesOnOneTimePurchase
                        appliesOnSubscription
                        value {
                          ... on DiscountAmount {
                            __typename
                            appliesOnEachItem
                            amount {
                              amount
                              currencyCode
                            }
                          }
                          ... on DiscountOnQuantity {
                            __typename
                            effect {
                              ... on DiscountAmount {
                                __typename
                                appliesOnEachItem
                                amount {
                                  amount
                                  currencyCode
                                }
                              }
                              ... on DiscountPercentage {
                                __typename
                                percentage
                              }
                            }
                            quantity {
                              quantity
                            }
                          }
                          ... on DiscountPercentage {
                            __typename
                            percentage
                          }
                        }
                        items {
                          ... on AllDiscountItems {
                            __typename
                            allItems
                          }
                          ... on DiscountCollections {
                            __typename
                            collections(first: 250) {
                              edges {                    
                                node {
                                  id
                                  title
                                  handle
                                }
                              }
                              pageInfo{
                                endCursor
                                hasNextPage
                              }
                            }
                          }
                          ... on DiscountProducts {
                            __typename
                            products(first: 250) {
                              edges {
                                node {
                                  featuredMedia {
                                    preview {
                                      image {
                                        url
                                      }
                                    }
                                  }
                                  id
                                  status
                                  handle
                                  title
                                  variants(first: 100) {
                                    edges {                          
                                      node {
                                        id
                                        price
                                        title  
                                        sku                          
                                      }
                                    }
                                    pageInfo{
                                      endCursor
                                      hasNextPage
                                    }
                                  }
                                }
                              }
                              pageInfo{
                                endCursor
                                hasNextPage
                              }
                            }
                            productVariants(first: 250) {
                              edges {                    
                                node {
                                  id
                                  price
                                  title
                                  sku
                                  product {
                                    id
                                    status
                                    title
                                    handle
                                    featuredMedia {
                                      preview {
                                        image {
                                          url
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                              pageInfo{
                                endCursor
                                hasNextPage
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }`,
              {
                variables: { id },
              }
          );

          const AutomaticBasicDiscountResponseResult = await AutomaticBasicDiscountResponse.json();
              
          if(AutomaticBasicDiscountResponseResult.data?.errors){
            console.error("Error fetching discount:", AutomaticBasicDiscountResponseResult.data.errors);
            return new Response();
          }  

          let AutomaticBasicDiscountData = AutomaticBasicDiscountResponseResult.data.discountNode.discount;      
        

          if(AutomaticBasicDiscountData.title) {

            discount = {
              type: "AutomaticDiscountCodeBasic",
              id: id,
              status: AutomaticBasicDiscountData.status,
              title: AutomaticBasicDiscountData?.title,
              endsAt: AutomaticBasicDiscountData?.endsAt,
              startsAt: AutomaticBasicDiscountData?.startsAt,
              recurringCycleLimit: AutomaticBasicDiscountData?.recurringCycleLimit,
              usageLimit: AutomaticBasicDiscountData?.usageLimit,
              appliesOncePerCustomer: AutomaticBasicDiscountData?.appliesOncePerCustomer,
              minimumRequirements: {
                greaterThanOrEqualToQuantity: AutomaticBasicDiscountData?.minimumRequirement?.greaterThanOrEqualToQuantity || null,
                greaterThanOrEqualToSubtotal: {
                  amount: AutomaticBasicDiscountData?.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount || null,
                  currencyCode: AutomaticBasicDiscountData?.minimumRequirement?.greaterThanOrEqualToSubtotal?.currencyCode || null
                }
              },
              code: null,
              customerGets: {
                appliesOnOneTimePurchase: AutomaticBasicDiscountData?.customerGets?.appliesOnOneTimePurchase || false,
                appliesOnSubscription: AutomaticBasicDiscountData?.customerGets?.appliesOnSubscription || false,
                value: {
                  appliesOnEachItem: AutomaticBasicDiscountData?.customerGets?.value?.appliesOnEachItem || false,
                  DiscountAmount: {
                    amount: AutomaticBasicDiscountData?.customerGets?.value?.amount?.amount || null,
                    currencyCode: AutomaticBasicDiscountData?.customerGets?.value?.amount?.currencyCode || null
                  },
                  DiscountOnQuantity: {
                    DiscountAmount: {
                      amount: AutomaticBasicDiscountData?.customerGets?.value?.effect?.DiscountAmount?.appliesOnEachItem?.amount?.amount || null,
                      currencyCode: AutomaticBasicDiscountData?.customerGets?.value?.DiscountOnQuantity?.effect?.DiscountAmount?.appliesOnEachItem?.amount?.currencyCode || null
                    },
                    DiscountPercentage: {
                      percentage: AutomaticBasicDiscountData?.customerGets?.value?.effect?.DiscountPercentage?.percentage || null
                    },
                    quantity: {
                      quantity: AutomaticBasicDiscountData?.customerGets?.value?.DiscountOnQuantity?.quantity?.quantity || null
                    }
                  },
                  percentage: AutomaticBasicDiscountData?.customerGets?.value?.percentage || null
                },
                items: {
                  allItems: AutomaticBasicDiscountData?.customerGets?.items?.DiscountItemsAll?.allItems || false,
                  collections: AutomaticBasicDiscountData?.customerGets?.items?.collections?.edges || null,
                  products: AutomaticBasicDiscountData?.customerGets?.items?.products?.edges || null,
                  productVariants: AutomaticBasicDiscountData?.customerGets?.items?.productVariants?.edges || null
                }
              }
            };


            let dbData = {
              type: discount.type,        
              title: discount?.title,
              endsAt: discount?.endsAt,
              startsAt: discount?.startsAt,
              discountGid: id,
              shop: shop,
              status: discount?.status,
              minimumRequirement : discount?.minimumRequirements,
              customerSelection: discount?.customerSelection,
              customerBuys: discount?.customerBuys,
              customerGets: discount?.customerGets,
              collectionAllProducts: discount.customerGets.items.allItems
            };

            let productIds = [];
            let variantIds = [];
            let collectionIds = []; 

            if(discount.customerGets.items.productVariants != null ){
              discount.customerGets.items.productVariants?.forEach((variant) => {           
                variantIds.push(variant.node.id);
                productIds.push(variant.node.product.id);
              });
            }

            if(discount.customerGets.items.products != null ){
              discount.customerGets.items.products?.forEach((product) => {           
                productIds.push(product.node.id);
                product.node.variants?.edges?.forEach((variant) => {
                  variantIds.push(variant.node.id);
                });
              });
            }

            if(discount.customerGets.items.collections != null ){   
              discount.customerGets.items.collections?.forEach((collection) => {           
                collectionIds.push(collection.node.id);           
              });
            }

            productIds = [...new Set(productIds)];
            variantIds = [...new Set(variantIds)];
            collectionIds = [...new Set(collectionIds)];


            dbData.productIds = productIds?.length > 0 ? productIds.join(',') : null;
            dbData.variantIds = variantIds?.length > 0 ? variantIds.join(',') : null;
            dbData.collectionIds = collectionIds?.length > 0 ? collectionIds.join(',') : null;


            // Save the discount to the database
            let exists = await getDiscountById(shop, dbData.discountGid);
            if(exists == null || exists == undefined){
              await createDiscount(dbData);
            }


          }else{
            // Manual BxGy Discount
            const ManualBxGyDiscountResponse = await admin.graphql(
              `#graphql
                query GetManualBxGyDiscountById($id: ID!) {
                  discountNode(id: $id) {
                    id
                    discount {
                      ... on DiscountCodeBxgy {
                        endsAt
                        usageLimit
                        title
                        status
                        startsAt
                        customerBuys {
                          isOneTimePurchase
                          isSubscription
                          items {
                            ... on AllDiscountItems {
                              __typename
                              allItems
                            }
                            ... on DiscountCollections {
                              __typename
                              collections(first: 250) {
                                edges {                  
                                  node {
                                    id
                                    handle
                                    title
                                    image {
                                      url
                                    }
                                  }
                                }
                                pageInfo {
                                  endCursor
                                  hasNextPage
                                }
                              }
                            }
                            ... on DiscountProducts {
                              __typename
                              products(first: 250) {
                                edges {                  
                                  node {                         
                                    featuredMedia {
                                      preview {
                                        image {
                                          url
                                        }
                                      }
                                    }                          
                                    id
                                    title
                                    status
                                    handle
                                    variants(first: 100) {
                                      edges {                        
                                        node {
                                          id
                                          price
                                          title
                                        }
                                      }
                                      pageInfo {
                                        endCursor
                                        hasNextPage
                                      }
                                    }
                                  }
                                }
                                pageInfo {
                                  endCursor
                                  hasNextPage
                                }
                              }
                              productVariants(first: 250) {
                                edges {                  
                                  node {
                                    id
                                    price
                                    title
                                    sku
                                    product {
                                      id
                                      title
                                      status
                                      handle
                                      featuredMedia {
                                        preview {
                                          image {
                                            url
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                pageInfo {
                                  endCursor
                                  hasNextPage
                                }
                              }
                            }
                          }
                          value {
                            ... on DiscountPurchaseAmount {
                              __typename
                              amount
                            }
                            ... on DiscountQuantity {
                              __typename
                              quantity
                            }
                          }
                        }
                        customerGets {
                          appliesOnOneTimePurchase
                          appliesOnSubscription
                          value {
                            ... on DiscountAmount {
                              __typename
                              appliesOnEachItem
                              amount {
                                amount
                                currencyCode
                              }
                            }
                            ... on DiscountOnQuantity {
                              __typename
                              effect {
                                ... on DiscountAmount {
                                  __typename
                                  appliesOnEachItem
                                  amount {
                                    amount
                                    currencyCode
                                  }
                                }
                                ... on DiscountPercentage {
                                  __typename
                                  percentage
                                }
                              }
                              quantity {
                                quantity
                              }
                            }
                            ... on DiscountPercentage {
                              __typename
                              percentage
                            }
                          }
                          items {
                            ... on AllDiscountItems {
                              __typename
                              allItems
                            }
                            ... on DiscountCollections {
                              __typename
                              collections(first: 250) {
                                edges {
                                  node {
                                    id
                                    title
                                    handle
                                  }
                                }
                                pageInfo {
                                  endCursor
                                  hasNextPage
                                }
                              }
                            }
                            ... on DiscountProducts {
                              __typename
                              productVariants(first: 250) {
                                edges {
                                  node {
                                    id
                                    title
                                    price
                                    sku
                                    product {
                                      id
                                      status
                                      title
                                      handle
                                      featuredMedia {
                                        preview {
                                          image {
                                            url
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                pageInfo {
                                  endCursor
                                  hasNextPage
                                }
                              }
                              products(first: 250) {
                                edges {                  
                                  node {
                                    featuredMedia {
                                      preview {
                                        image {
                                          url
                                        }
                                      }
                                    }
                                    id
                                    title
                                    status
                                    handle
                                    variants(first: 100) {
                                      edges {                        
                                        node {
                                          id
                                          price
                                          sku
                                          title
                                        }
                                      }
                                      pageInfo {
                                        endCursor
                                        hasNextPage
                                      }
                                    }
                                  }
                                }
                                pageInfo {
                                  endCursor
                                  hasNextPage
                                }
                              }
                            }
                          }
                        }
                        customerSelection {
                          ... on DiscountCustomerAll {
                            __typename
                            allCustomers
                          }
                          ... on DiscountCustomerSegments {
                            __typename
                            segments {
                              id
                              name
                            }
                          }
                          ... on DiscountCustomers {
                            __typename
                            customers {
                              id
                              displayName
                            }
                          }
                        }
                      }
                    }
                  }
                }`,
              {
                variables: { id },
              }
              
            );
          
            const ManualBxGyDiscountResponseResult = await ManualBxGyDiscountResponse.json();
                
            if(ManualBxGyDiscountResponseResult.data.errors){
              console.error("Error fetching discount:", ManualBxGyDiscountResponseResult.data.errors);
              return new Response();
            }  

            let ManualBxGyDiscountData = ManualBxGyDiscountResponseResult.data.discountNode.discount;

            if(ManualBxGyDiscountData.title ){

              discount = {
                type: "ManualDiscountCodeBxgy",
                id: id,
                status: ManualBxGyDiscountData.status,
                title: ManualBxGyDiscountData.title,
                endsAt: ManualBxGyDiscountData.endsAt,
                startsAt: ManualBxGyDiscountData.startsAt,
                recurringCycleLimit: ManualBxGyDiscountData.recurringCycleLimit,
                usageLimit: ManualBxGyDiscountData.usageLimit,
                appliesOncePerCustomer: ManualBxGyDiscountData.appliesOncePerCustomer,
                customerBuys: {
                  isOneTimePurchase: ManualBxGyDiscountData.customerBuys?.isOneTimePurchase || false,
                  isSubscription: ManualBxGyDiscountData.customerBuys?.isSubscription || false,
                  items: {
                    allItems: ManualBxGyDiscountData.customerBuys?.items?.DiscountItemsAll?.allItems || false,
                    collections: ManualBxGyDiscountData.customerBuys?.items?.collections?.edges || null,
                    products: ManualBxGyDiscountData.customerBuys?.items?.products?.edges || null,
                    productVariants: ManualBxGyDiscountData.customerBuys?.items?.productVariants?.edges || null
                  },
                  value: {
                    amount: ManualBxGyDiscountData.customerBuys?.value?.amount || 0,
                    quantity: ManualBxGyDiscountData.customerBuys?.value?.quantity || 1
                  }
                },
                code: null,
                customerSelection:{
                  allCustomers: ManualBxGyDiscountData.customerSelection?.allCustomers || false,
                  segments: ManualBxGyDiscountData.customerSelection?.segments || null,
                  customers: ManualBxGyDiscountData.customerSelection?.customers || null
                },
                customerGets: {
                  appliesOnOneTimePurchase: ManualBxGyDiscountData.customerGets?.appliesOnOneTimePurchase || false,
                  appliesOnSubscription: ManualBxGyDiscountData.customerGets?.appliesOnSubscription || false,
                  value: {
                    appliesOnEachItem: ManualBxGyDiscountData.customerGets?.value?.appliesOnEachItem || false,
                    DiscountAmount: {
                      amount: ManualBxGyDiscountData.customerGets?.value?.amount?.amount || null,
                      currencyCode: ManualBxGyDiscountData.customerGets?.value?.amount?.currencyCode || null
                    },
                    DiscountOnQuantity: {
                      DiscountAmount: {
                        amount: ManualBxGyDiscountData.customerGets?.value?.effect?.amount?.amount || null,
                        currencyCode: ManualBxGyDiscountData.customerGets?.value?.DiscountOnQuantity?.effect?.amount?.currencyCode || null
                      },
                      DiscountPercentage: {
                        percentage: ManualBxGyDiscountData.customerGets?.value?.effect?.percentage || null
                      },
                      quantity: {
                        quantity: ManualBxGyDiscountData.customerGets?.value?.quantity?.quantity || null
                      }
                    },
                    percentage: ManualBxGyDiscountData.customerGets?.value?.percentage || null
                  },
                  items: {
                    allItems: ManualBxGyDiscountData.customerGets?.items?.DiscountItemsAll?.allItems || false,
                    collections: ManualBxGyDiscountData.customerGets?.items?.collections?.edges || null,
                    products: ManualBxGyDiscountData.customerGets?.items?.products?.edges || null,
                    productVariants: ManualBxGyDiscountData.customerGets?.items?.productVariants?.edges || null
                  }
                }
              };

              let dbData = {
                type: discount.type,        
                title: discount?.title,
                endsAt: discount?.endsAt,
                startsAt: discount?.startsAt,
                discountGid: id,
                shop: shop,
                status: discount?.status,
                minimumRequirement : discount?.minimumRequirements,
                customerSelection: discount?.customerSelection,
                customerBuys: discount?.customerBuys,
                customerGets: discount?.customerGets,
                collectionAllProducts: discount.customerGets.items.allItems
              };

              let productIds = [];
              let variantIds = [];
              let collectionIds = []; 

              if(discount.customerGets.items.productVariants != null ){
                discount.customerGets.items.productVariants?.forEach((variant) => {           
                  variantIds.push(variant.node.id);
                  productIds.push(variant.node.product.id);
                });
              }

              if(discount.customerGets.items.products != null ){
                discount.customerGets.items.products?.forEach((product) => {           
                  productIds.push(product.node.id);
                  product.node.variants?.edges?.forEach((variant) => {
                    variantIds.push(variant.node.id);
                  });
                });
              }

              if(discount.customerGets.items.collections != null ){   
                discount.customerGets.items.collections?.forEach((collection) => {           
                  collectionIds.push(collection.node.id);           
                });
              }

              productIds = [...new Set(productIds)];
              variantIds = [...new Set(variantIds)];
              collectionIds = [...new Set(collectionIds)];


              dbData.productIds = productIds?.length > 0 ? productIds.join(',') : null;
              dbData.variantIds = variantIds?.length > 0 ? variantIds.join(',') : null;
              dbData.collectionIds = collectionIds?.length > 0 ? collectionIds.join(',') : null;


              // Save the discount to the database
              let exists = await getDiscountById(shop, dbData.discountGid);
              if(exists == null || exists == undefined){
                await createDiscount(dbData);
              }



              
            }else{

              // Automatic BxGy Discount
              const AutomaticBxGyDiscountResponse = await admin.graphql(
                `#graphql
                  query GetBxgyDiscountAutomaticById($id: ID!) {
                    discountNode(id: $id) {
                      id
                      discount {
                        ... on DiscountAutomaticBxgy {
                          title
                          status
                          startsAt
                          endsAt
                          customerBuys {
                            isOneTimePurchase
                            isSubscription
                            items {
                              ... on AllDiscountItems {
                                __typename
                                allItems
                              }
                              ... on DiscountCollections {
                                __typename
                                collections(first: 100) {
                                  edges {
                                    node {
                                      id
                                      title
                                      handle
                                      image {
                                        url
                                      }
                                    }
                                  }
                                  pageInfo {
                                    endCursor
                                    hasNextPage
                                  }
                                }
                              }
                              ... on DiscountProducts {
                                __typename
                                products(first: 250) {
                                  edges {
                                    node {
                                      featuredMedia {
                                        preview {
                                          image {
                                            url
                                          }
                                        }
                                      } 
                                      id
                                      title
                                      status
                                      handle
                                      variants(first: 100) {
                                        edges {                              
                                          node {
                                            id
                                            price
                                            title
                                            sku
                                          }
                                        }
                                      }
                                    }
                                  }
                                  pageInfo {
                                    endCursor
                                    hasNextPage
                                  }
                                }
                                productVariants(first: 250) {
                                  edges {
                                    node {
                                      id
                                      title
                                      price
                                      sku
                                      product {
                                        id
                                        status
                                        title
                                        handle
                                        featuredMedia {
                                          preview {
                                            image {
                                              url
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                  pageInfo {
                                    hasNextPage
                                    endCursor
                                  }
                                }
                              }
                            }
                            isOneTimePurchase
                            isSubscription
                          }
                          customerGets {
                            appliesOnOneTimePurchase
                            appliesOnSubscription
                            value {
                              ... on DiscountAmount {
                                __typename
                                appliesOnEachItem
                                amount {
                                  amount
                                  currencyCode
                                }
                              }
                              ... on DiscountOnQuantity {
                                __typename
                                effect {
                                  ... on DiscountAmount {
                                    __typename
                                    appliesOnEachItem
                                    amount {
                                      amount
                                      currencyCode
                                    }
                                  }
                                  ... on DiscountPercentage {
                                    __typename
                                    percentage
                                  }
                                }
                                quantity {
                                  quantity
                                }
                              }
                              ... on DiscountPercentage {
                                __typename
                                percentage
                              }
                            }
                            items {
                              ... on AllDiscountItems {
                                __typename
                                allItems
                              }
                              ... on DiscountCollections {
                                __typename
                                collections(first: 250) {
                                  edges {
                                    node {
                                      id
                                      title
                                      handle
                                    }
                                  }
                                  pageInfo {
                                    endCursor
                                    hasNextPage
                                  }
                                }
                              }
                              ... on DiscountProducts {
                                __typename
                                products(first: 250) {
                                  edges {                        
                                    node {
                                      featuredMedia {
                                        preview {
                                          image {
                                            url
                                          }
                                        }
                                      }
                                      id
                                      title
                                      handle
                                      status
                                      variants(first: 100) {
                                        edges {
                                          node {
                                            id
                                            price
                                            title
                                            sku
                                          }
                                        }
                                        pageInfo {
                                          endCursor
                                          hasNextPage
                                        }
                                      }
                                    }
                                  }
                                  pageInfo{
                                    endCursor
                                    hasNextPage
                                  }
                                }
                                productVariants(first: 250) {
                                  edges {
                                    node {
                                      id
                                      price
                                      sku
                                      title
                                      product {
                                        id
                                        title
                                        status
                                        handle
                                        featuredMedia {
                                          preview {
                                            image {
                                              url
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                  pageInfo{
                                    endCursor
                                    hasNextPage
                                  }
                                }
                              }
                            }
                            appliesOnOneTimePurchase
                            appliesOnSubscription
                          }
                        }
                      }
                    }
                  }`,
                {
                  variables: { id },
                }
              );

              const AutomaticBxGyDiscountResponseResult = await AutomaticBxGyDiscountResponse.json();
                  
              if(AutomaticBxGyDiscountResponseResult.data.errors){
                console.error("Error fetching discount:", AutomaticBxGyDiscountResponseResult.data.errors);
                return new Response();
              }

              let AutomaticBxGyDiscount = AutomaticBxGyDiscountResponseResult.data.discountNode.discount;

              if(AutomaticBxGyDiscount.title) {

                discount = {
                  type: "AutomaticDiscountCodeBxgy",
                  id: id,
                  status: AutomaticBxGyDiscount.status,
                  title: AutomaticBxGyDiscount.title,
                  endsAt: AutomaticBxGyDiscount.endsAt,
                  startsAt: AutomaticBxGyDiscount.startsAt,
                  recurringCycleLimit: AutomaticBxGyDiscount.recurringCycleLimit,
                  usageLimit: AutomaticBxGyDiscount.usageLimit,
                  appliesOncePerCustomer: AutomaticBxGyDiscount.appliesOncePerCustomer,
                  customerBuys: {
                    isOneTimePurchase: AutomaticBxGyDiscount.customerBuys?.isOneTimePurchase || false,
                    isSubscription: AutomaticBxGyDiscount.customerBuys?.isSubscription || false,
                    items: {
                      allItems: AutomaticBxGyDiscount.customerBuys?.items?.DiscountItemsAll?.allItems || false,
                      collections: AutomaticBxGyDiscount.customerBuys?.items?.collections?.edges || null,
                      products: AutomaticBxGyDiscount.customerBuys?.items?.products?.edges || null,
                      productVariants: AutomaticBxGyDiscount.customerBuys?.items?.productVariants?.edges || null
                    },
                    value: {
                      amount: AutomaticBxGyDiscount.customerBuys?.value?.amount || null,
                      quantity: AutomaticBxGyDiscount.customerBuys?.value?.quantity || null
                    }
                  },
                  code: null,
                  customerSelection:{
                    allCustomers: AutomaticBxGyDiscount.customerSelection?.allCustomers || false,
                    segments: AutomaticBxGyDiscount.customerSelection?.segments || null,
                    customers: AutomaticBxGyDiscount.customerSelection?.customers || null
                  },
                  customerGets: {
                    appliesOnOneTimePurchase: AutomaticBxGyDiscount.customerGets?.appliesOnOneTimePurchase || false,
                    appliesOnSubscription: AutomaticBxGyDiscount.customerGets?.appliesOnSubscription || false,
                    value: {
                      appliesOnEachItem: AutomaticBxGyDiscount.customerGets?.value?.appliesOnEachItem || false,
                      DiscountAmount: {
                        amount: AutomaticBxGyDiscount.customerGets?.value?.amount?.amount || null,
                        currencyCode: AutomaticBxGyDiscount.customerGets?.value?.amount?.currencyCode || null
                      },
                      DiscountOnQuantity: {
                        DiscountAmount: {
                          amount: AutomaticBxGyDiscount.customerGets?.value?.effect?.amount?.amount || null,
                          currencyCode: AutomaticBxGyDiscount.customerGets?.value?.DiscountOnQuantity?.effect?.amount?.currencyCode || null
                        },
                        DiscountPercentage: {
                          percentage: AutomaticBxGyDiscount.customerGets?.value?.effect?.percentage || null
                        },
                        quantity: {
                          quantity: AutomaticBxGyDiscount.customerGets?.value?.DiscountOnQuantity?.quantity?.quantity || null
                        }
                      },
                      percentage: AutomaticBxGyDiscount.customerGets?.value?.percentage || null
                    },
                    items: {
                      allItems: AutomaticBxGyDiscount.customerGets?.items?.DiscountItemsAll?.allItems || false,
                      collections: AutomaticBxGyDiscount.customerGets?.items?.collections?.edges || null,
                      products: AutomaticBxGyDiscount.customerGets?.items?.products?.edges || null,
                      productVariants: AutomaticBxGyDiscount.customerGets?.items?.productVariants?.edges || null
                    }
                  }
                };

                let dbData = {
                  type: discount.type,        
                  title: discount?.title,
                  endsAt: discount?.endsAt,
                  startsAt: discount?.startsAt,
                  discountGid: id,
                  shop: shop,
                  status: discount?.status,
                  minimumRequirement : discount?.minimumRequirements,
                  customerSelection: discount?.customerSelection,
                  customerBuys: discount?.customerBuys,
                  customerGets: discount?.customerGets,
                  collectionAllProducts: discount.customerGets.items.allItems
                };

                let productIds = [];
                let variantIds = [];
                let collectionIds = []; 

                if(discount.customerGets.items.productVariants != null ){
                  discount.customerGets.items.productVariants?.forEach((variant) => {           
                    variantIds.push(variant.node.id);
                    productIds.push(variant.node.product.id);
                  });
                }

                if(discount.customerGets.items.products != null ){
                  discount.customerGets.items.products?.forEach((product) => {           
                    productIds.push(product.node.id);
                    product.node.variants?.edges?.forEach((variant) => {
                      variantIds.push(variant.node.id);
                    });
                  });
                }

                if(discount.customerGets.items.collections != null ){   
                  discount.customerGets.items.collections?.forEach((collection) => {           
                    collectionIds.push(collection.node.id);           
                  });
                }

                productIds = [...new Set(productIds)];
                variantIds = [...new Set(variantIds)];
                collectionIds = [...new Set(collectionIds)];


                dbData.productIds = productIds?.length > 0 ? productIds.join(',') : null;
                dbData.variantIds = variantIds?.length > 0 ? variantIds.join(',') : null;
                dbData.collectionIds = collectionIds?.length > 0 ? collectionIds.join(',') : null;


                // Save the discount to the database
                let exists = await getDiscountById(shop, dbData.discountGid);
                if(exists == null || exists == undefined){
                  await createDiscount(dbData);
                }

              }

            }      
          }
        }


    
        
        if (!discount || discount === null) {
          console.error("No discount found for ID:", id);
          return new Response();
        }

   //console.log("Discount:", {discount});  



      }
  }

  return new Response();
};
