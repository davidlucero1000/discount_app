import { BlockStack, Card, Text, InlineStack, Box, Button, Badge, ButtonGroup } from "@shopify/polaris";

export const PricingCard = ({ active, title, description, price, features, featuredText, button, frequency, name }) => {
  return (
    <div
      style={{
        width: "18rem",
        boxShadow: featuredText ? "0px 0px 15px 4px #CDFEE1" : "none",
        borderRadius: ".75rem",
        position: "relative",
        zIndex: "0",
      }}
    >
      {featuredText ? (
        <div style={{ position: "absolute", top: "-15px", right: "6px", zIndex: "100" }}>
          <Badge size="large" tone="success">
            {featuredText}
          </Badge>
        </div>
      ) : null}
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="200" align="start">
            <Text as="h3" variant="headingLg">
              {title} <span style={{fontSize:"12px",fontWeight:"normal"}} >({name})</span>
            </Text>
            {description ? (
              <Text as="p" variant="bodySm" tone="subdued">
                {description}
              </Text>
            ) : null}
          </BlockStack>

          <InlineStack blockAlign="end" gap="100" align="start">
            <Text as="h2" variant="heading2xl">
              {price}
            </Text>
            <Box paddingBlockEnd="200">
              <Text variant="bodySm">/ {frequency}</Text>
            </Box>
          </InlineStack>

          <BlockStack gap="100">
            {features?.map((feature, id) => (
              <Text tone="subdued" as="p" variant="bodyMd" key={id}>
                {feature}
              </Text>
            ))}
          </BlockStack>

          <Box paddingBlockStart="200" paddingBlockEnd="200">
            {!active? 
              (
                <ButtonGroup fullWidth>
                  <Button {...button.props}>{button.content}</Button>
                </ButtonGroup>
              ) : (
                <Button                 
                  fullWidth
                  primary
                  disabled
                >
                  Current Plan
                </Button>                
              )
            }
          </Box>
        </BlockStack>
      </Card>
    </div>
  );
};
