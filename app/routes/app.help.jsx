import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import {
    BlockStack,
    Box,
    Button,
    Card,
    Form,
    FormLayout,
    MediaCard,
    Page,
    Text,
    TextField
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { checkSubscriptionStatus } from "../models/Subscription.server";
import { useEffect, useState } from "react";
import { Resend } from 'resend';


export const loader = async ({ request }) => {
  const { session, billing, redirect } = await authenticate.admin(request);
  const shop = session.shop;

  const billingRequire = await checkSubscriptionStatus(billing, redirect);

  if(!billingRequire.hasActivePayment) {
    return redirect(`/app/pricing`);
  }
  
  return {shop};
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const requestData = await request.formData();
  const formData = Object.fromEntries(requestData); 

  const resend = new Resend("re_AzjW9D94_Bujwsfo9mpSHKwQH4VomsgF1");

  const { data, error } = await resend.emails.send({
    from: "abc@advised-debate-animal-white.trycloudflare.com", 
    to: ['sunil@brandography.com'],
    subject: 'Product Discount App - Help Request',
    html: '<strong>It works!</strong>',
  });

  if (error) {
    return { error:true, message:error?.message};
  }

  return { success: true, message: 'Your message has been sent successfully!' };
  
};

export default function Help() {

  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const loaderData = useLoaderData();
  const actionData = useActionData();

  const [btnLoader, setBtnLoader] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    store_url: ''
  });

  useEffect(() => {
    if(actionData) {
        setBtnLoader(false);
        if(actionData.success) {
            setFormData({
                name: '',
                email: '',
                store_url: '',
                message: ''
            });
            // setSuccessMsg(actionData.message);
            shopify.toast.show({
                message: actionData.message,
                duration: 5000,
                isError: false,
            })
        }
        if(actionData.error) {           
            shopify.toast.show({
                message: actionData.message,
                duration: 5000,
                isError: true,
            })
        }
    }
  }, [actionData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setBtnLoader(true);
    fetcher.submit(formData, { method: 'post' });
  };
 
 
  return (
    <Page>
        <BlockStack gap="500">
           

            <MediaCard
                size="small"
                className="custom-help-card" 
                title=" Need Help with Discount Blocks?"               
                description="Our support team can assist you with setting up and managing discount blocks on your product pages. We’ll help you customize the display so customers clearly see available offers, encouraging more conversions before they add items to their cart."
                >
                <img                   
                    width="120px"
                    style={{objectFit: 'contain', objectPosition: 'center', maxWidth: '200px', padding: '10px', flexBasis:"unset", margin:"0 auto"}}
                    src="./../customer-service-headset-svgrepo-com.svg"
                />
                </MediaCard>

            <Card roundedAbove="sm">
                <Text as="h2" variant="headingSm">
                    Send us a message !!
                </Text>
                <Box paddingBlockStart="500" paddingBlockEnd="500">
                    <Form onSubmit={handleSubmit} method="post">
                        <FormLayout>
                            <TextField
                                value={formData.name}
                                onChange={(value) => {formData.name = value; setFormData({...formData})}}
                                label="Name"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your name"
                                required                                
                            />

                            <TextField
                                value={formData.email}
                                onChange={(value) => {formData.email = value; setFormData({...formData})}}
                                label="Email"
                                type="email"
                                autoComplete="email"
                                placeholder="Enter your email"
                                required
                                helpText={
                                    <span>
                                    We’ll use this email address to inform you on future changes to
                                    Polaris.
                                    </span>
                                }
                            />

                            <TextField
                                value={formData.store_url}
                                onChange={(value) => {formData.store_url = value; setFormData({...formData})}}
                                label="Store URL"
                                placeholder="https://your-store.myshopify.com"
                                required
                                type="url"
                                autoComplete="url"                               
                            />

                            <TextField
                                value={formData.message}
                                onChange={(value) => {formData.message = value; setFormData({...formData})}}
                                label="Message"
                                placeholder="Write your message here..."
                                required
                                type="text"
                                multiline={4}                             
                            />

                            <Button size="large" loading={btnLoader} variant="primary"  submit>Submit</Button>
                             
                            { errorMsg != null ?
                                <Text as="p" variant="bodyMd" color="critical">
                                    {errorMsg}
                                </Text>
                                : null
                            }

                            { successMsg != null ?
                                <Text as="p" variant="bodyMd" color="success">
                                    {successMsg}
                                </Text>
                                : null
                            }
                           

                        </FormLayout>
                    </Form>
                </Box>
            </Card>
        </BlockStack>
    </Page>
  );
}
