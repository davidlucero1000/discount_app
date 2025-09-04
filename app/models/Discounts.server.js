import db from "../db.server";

export async function getDiscountsByShop(shop) {
    return await db.discounts.findMany({
        where: { shop: shop, status:"ACTIVE"}, orderBy: { id: 'desc' }
    });
}

export async function getDiscountById(shop, id) {
    return await db.discounts.findFirst({
        where: { discountGid: id, shop: shop},
    });
}

export async function getDiscountByCollectionId(shop, collectionId) {
    return await db.discounts.findMany({
        where: {
            shop: shop,
            collectionIds:{
                contains: collectionId
            },
            status: "ACTIVE"
        },
    });
}

export async function getDiscountByProductId(shop, productId) {
    return await db.discounts.findMany({
        where: {
            shop: shop,
            productIds:{
                contains: productId
            },
            status: "ACTIVE"
        },
    });
}

export async function getDiscountByVarisntId(shop, variantId) {
    return await db.discounts.findMany({
        where: {
            shop: shop,
            variantIds:{
                contains: variantId
            },
            status: "ACTIVE"
        },
    });
}

export async function getDiscountByCollectionIdsAndProductIdsAndVarisntId(shop, collectionId, productId, variantId) {
    return await db.discounts.findMany({
        where: {
            shop: shop,
            collectionIds:{
                contains: collectionId
            },
            productIds:{
                contains: productId
            },
            variantIds:{
                contains: variantId
            },
            status: "ACTIVE"
        },
    });
}

export async function getDiscountByCollectionIdsaOrProductIdsOrVarisntId(shop, collectionId, productId, variantId) {
    return await db.discounts.findMany({
        where: {
            shop: shop,        
            or: [
                { collectionIds: { ccontains: collectionId } },
                { productIds: { ccontains: productId } },
                { variantIds: { ccontains: variantId } }
            ],
            status: "ACTIVE"
        }
    });
}


export async function createDiscount(data) {
    return await db.discounts.create(
        { data: data }
    );
}

export async function updateDiscount(data) {
    return await db.discounts.update(
        { where: { discountGid: data.id } },
        { data: data }
    );
}


export async function deleteDiscount(id) {
    return await db.discounts.delete(
        { where: { id: id } }
    );
}

