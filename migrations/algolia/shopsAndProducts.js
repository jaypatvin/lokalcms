"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var admin = require("firebase-admin");
var lodash_1 = require("lodash");
var db = admin.firestore();
var shopFields = [
    '_meta',
    'archived',
    'community_id',
    'cover_photo',
    'created_at',
    'description',
    'is_close',
    'name',
    'operating_hours',
    'payment_options',
    'profile_photo',
    'status',
    'user_id',
    'updated_at',
];
var productFields = [
    '_meta',
    'archived',
    'availability',
    'base_price',
    'can_subscribe',
    'community_id',
    'created_at',
    'description',
    'gallery',
    'name',
    'product_category',
    'quantity',
    'shop_id',
    'status',
    'user_id',
    'updated_at',
];
var importShopsAndProducts = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var shopsIndex, shopsNameDescIndex, shopsCreatedAtAscIndex, shopsCreatedAtDescIndex, productsIndex, productsNameDescIndex, productsCreatedAtAscIndex, productsCreatedAtDescIndex, productsPriceAscIndex, productsPriceDescIndex, shopsRef, shopDocs, productDocs, _i, _a, shop, shopData, moreInfo, productsRef, _b, _c, product, productData, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                shopsIndex = client.initIndex('shops');
                shopsNameDescIndex = client.initIndex('shops_name_desc');
                shopsCreatedAtAscIndex = client.initIndex('shops_created_at_asc');
                shopsCreatedAtDescIndex = client.initIndex('shops_created_at_desc');
                productsIndex = client.initIndex('products');
                productsNameDescIndex = client.initIndex('products_name_desc');
                productsCreatedAtAscIndex = client.initIndex('products_created_at_asc');
                productsCreatedAtDescIndex = client.initIndex('products_created_at_desc');
                productsPriceAscIndex = client.initIndex('products_price_asc');
                productsPriceDescIndex = client.initIndex('products_price_desc');
                return [4 /*yield*/, db.collection('shops').get()];
            case 1:
                shopsRef = _d.sent();
                shopDocs = [];
                productDocs = [];
                _i = 0, _a = shopsRef.docs;
                _d.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                shop = _a[_i];
                shopData = shop.data();
                moreInfo = {
                    categories: [],
                    products: []
                };
                return [4 /*yield*/, db.collection('products').where('shop_id', '==', shop.id).get()];
            case 3:
                productsRef = _d.sent();
                for (_b = 0, _c = productsRef.docs; _b < _c.length; _b++) {
                    product = _c[_b];
                    productData = product.data();
                    moreInfo.categories.push(productData.product_category);
                    moreInfo.products.push(productData.name);
                    productDocs.push(__assign(__assign({ objectID: product.id }, lodash_1.pick(productData, productFields)), { shop_name: shopData.name }));
                }
                moreInfo.categories = lodash_1.uniq(moreInfo.categories);
                shopDocs.push(__assign(__assign({ objectID: shop.id }, lodash_1.pick(shopData, shopFields)), moreInfo));
                _d.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                _d.trys.push([5, 20, , 21]);
                return [4 /*yield*/, shopsIndex.saveObjects(shopDocs)];
            case 6:
                _d.sent();
                return [4 /*yield*/, shopsIndex.setSettings({
                        replicas: ['shops_name_desc', 'shops_created_at_desc', 'shops_created_at_asc']
                    })];
            case 7:
                _d.sent();
                return [4 /*yield*/, shopsIndex.setSettings({
                        searchableAttributes: ['categories', 'name', 'products'],
                        ranking: [
                            'asc(name)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ],
                        attributesForFaceting: [
                            'filterOnly(categories)',
                            'filterOnly(community_id)',
                            'filterOnly(is_close)',
                            'filterOnly(products)',
                            'filterOnly(status)',
                            'filterOnly(user_id)',
                        ]
                    }, {
                        forwardToReplicas: true
                    })];
            case 8:
                _d.sent();
                return [4 /*yield*/, shopsNameDescIndex.setSettings({
                        ranking: [
                            'desc(name)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ]
                    })];
            case 9:
                _d.sent();
                return [4 /*yield*/, shopsCreatedAtAscIndex.setSettings({
                        ranking: [
                            'asc(created_at._seconds)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ]
                    })];
            case 10:
                _d.sent();
                return [4 /*yield*/, shopsCreatedAtDescIndex.setSettings({
                        ranking: [
                            'desc(created_at._seconds)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ]
                    })];
            case 11:
                _d.sent();
                console.log('shops imported to algolia');
                return [4 /*yield*/, productsIndex.saveObjects(productDocs)];
            case 12:
                _d.sent();
                return [4 /*yield*/, productsIndex.setSettings({
                        replicas: [
                            'products_name_desc',
                            'products_created_at_desc',
                            'products_created_at_asc',
                            'products_price_asc',
                            'products_price_desc',
                        ]
                    })];
            case 13:
                _d.sent();
                return [4 /*yield*/, productsIndex.setSettings({
                        searchableAttributes: ['product_category', 'name', 'shop_name'],
                        ranking: [
                            'asc(name)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ],
                        attributesForFaceting: [
                            'filterOnly(product_category)',
                            'filterOnly(community_id)',
                            'filterOnly(shop_id)',
                            'filterOnly(status)',
                            'filterOnly(user_id)',
                            'filterOnly(can_subscribe)',
                        ]
                    }, {
                        forwardToReplicas: true
                    })];
            case 14:
                _d.sent();
                return [4 /*yield*/, productsNameDescIndex.setSettings({
                        ranking: [
                            'desc(name)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ]
                    })];
            case 15:
                _d.sent();
                return [4 /*yield*/, productsCreatedAtAscIndex.setSettings({
                        ranking: [
                            'asc(created_at._seconds)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ]
                    })];
            case 16:
                _d.sent();
                return [4 /*yield*/, productsCreatedAtDescIndex.setSettings({
                        ranking: [
                            'desc(created_at._seconds)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ]
                    })];
            case 17:
                _d.sent();
                return [4 /*yield*/, productsPriceAscIndex.setSettings({
                        ranking: [
                            'asc(price)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ]
                    })];
            case 18:
                _d.sent();
                return [4 /*yield*/, productsPriceDescIndex.setSettings({
                        ranking: [
                            'desc(price)',
                            'typo',
                            'geo',
                            'words',
                            'filters',
                            'proximity',
                            'attribute',
                            'exact',
                            'custom',
                        ]
                    })];
            case 19:
                _d.sent();
                console.log('products imported to algolia');
                return [3 /*break*/, 21];
            case 20:
                error_1 = _d.sent();
                console.error(error_1);
                return [3 /*break*/, 21];
            case 21: return [2 /*return*/];
        }
    });
}); };
exports["default"] = importShopsAndProducts;
