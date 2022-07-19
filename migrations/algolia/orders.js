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
var orderFields = [
    'buyer_id',
    'community_id',
    'created_at',
    'delivery_address',
    'delivery_date',
    'delivered_date',
    'delivery_option',
    'is_paid',
    'instruction',
    'payment_method',
    'product_ids',
    'products',
    'proof_of_payment',
    'seller_id',
    'shop_id',
    'shop',
    'status_code',
    'updated_at',
    'cancellation_reason',
    'decline_reason',
    'product_subscription_id',
    'product_subscription_date',
    'total_price',
];
var importOrders = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var ordersIndex, ordersCreatedAtDescIndex, ordersRef, orderDocs, _i, _a, order, orderData, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                ordersIndex = client.initIndex('orders');
                ordersCreatedAtDescIndex = client.initIndex('orders_created_at_desc');
                return [4 /*yield*/, db.collection('orders').get()];
            case 1:
                ordersRef = _b.sent();
                orderDocs = [];
                for (_i = 0, _a = ordersRef.docs; _i < _a.length; _i++) {
                    order = _a[_i];
                    orderData = order.data();
                    orderDocs.push(__assign({ objectID: order.id }, lodash_1.pick(orderData, orderFields)));
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 7, , 8]);
                return [4 /*yield*/, ordersIndex.saveObjects(orderDocs)];
            case 3:
                _b.sent();
                return [4 /*yield*/, ordersIndex.setSettings({
                        replicas: ['orders_created_at_desc']
                    })];
            case 4:
                _b.sent();
                return [4 /*yield*/, ordersIndex.setSettings({
                        searchableAttributes: [
                            'products.name',
                            'shop.name',
                        ],
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
                        ],
                        attributesForFaceting: [
                            'filterOnly(buyer_id)',
                            'filterOnly(community_id)',
                            'filterOnly(delivery_option)',
                            'filterOnly(is_paid)',
                            'filterOnly(payment_method)',
                            'filterOnly(product_ids)',
                            'filterOnly(products.category)',
                            'filterOnly(seller_id)',
                            'filterOnly(shop_id)',
                            'filterOnly(status_code)',
                            'filterOnly(delivered_date._seconds)',
                        ]
                    }, {
                        forwardToReplicas: true
                    })];
            case 5:
                _b.sent();
                return [4 /*yield*/, ordersCreatedAtDescIndex.setSettings({
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
            case 6:
                _b.sent();
                console.log('orders imported to algolia');
                return [3 /*break*/, 8];
            case 7:
                error_1 = _b.sent();
                console.error(error_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports["default"] = importOrders;
