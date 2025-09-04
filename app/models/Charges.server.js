import db from "../db.server";

export async function getChargeByShop(shop) {
    return await db.charges.findFirst({
        where: { shop: shop, cancledAt: null, status: "ACTIVE" },orderBy: { id: "desc" },
        include: { chargeItems: true },
    });

}
export async function getChargeByChargeId(chargeId) {
    return await db.charges.findFirst({
        where: {
            chargeId: chargeId,
        },orderBy: { id: "desc" },
        include: {
            lineItems: true,
        },
    });
}

export async function insertCharge(subscription, shop) {
    
    let lineItems = subscription.lineItems.map((item) => ({
        lineItemId: item.id,
        amount: item.plan.pricingDetails.price.amount,
        currency: item.plan.pricingDetails.price.currencyCode,
        interval: item.plan.pricingDetails.interval,
        discount: item.plan.pricingDetails.discount,
    }));

    const chargeData = {
        shop: shop,
        chargeId: subscription.id,
        name: subscription.name,
        title: subscription.name,
        status: subscription.status,
        test: subscription.test,
        trialDays: subscription.trialDays,
        createdAt: subscription.createdAt,
        cancledAt:null,
        currentPeriodEnd: subscription.currentPeriodEnd,    
        chargeItems: {
            create: lineItems,   
        },
    };

    return await db.charges.create({data:chargeData});
}

export async function updateCharge(currentSubscriptionDB) {  
    const date = new Date();
    const chargeData = {       
        status: "CANCELED",
        cancledAt: date.toISOString(),
        shop:currentSubscriptionDB.shop,
    };

    return await db.charges.update({where: { id: currentSubscriptionDB.id }, data: chargeData, include: { chargeItems: true }});
}

