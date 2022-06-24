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
var reviewFields = [
    'user_id',
    'user_email',
    'message',
    'rating',
    'order_id',
    'product_id',
    'shop_id',
    'community_id',
    'created_at',
    'updated_at',
];
var importReviews = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var reviewsIndex, reviewsCreatedAtDescIndex, reviewsRatingAscIndex, reviewsRatingDescIndex, reviewsRef, reviewDocs, _i, _a, review, reviewData, userRef, userEmail, productRef, product, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                reviewsIndex = client.initIndex('reviews');
                reviewsCreatedAtDescIndex = client.initIndex('reviews_created_at_desc');
                reviewsRatingAscIndex = client.initIndex('reviews_rating_asc');
                reviewsRatingDescIndex = client.initIndex('reviews_rating_desc');
                return [4 /*yield*/, db.collectionGroup('reviews').get()];
            case 1:
                reviewsRef = _b.sent();
                reviewDocs = [];
                _i = 0, _a = reviewsRef.docs;
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                review = _a[_i];
                reviewData = review.data();
                return [4 /*yield*/, db.collection('users').doc(reviewData.user_id).get()];
            case 3:
                userRef = _b.sent();
                userEmail = userRef.data().email;
                return [4 /*yield*/, db.collection('products').doc(reviewData.product_id).get()];
            case 4:
                productRef = _b.sent();
                product = productRef.data();
                reviewDocs.push(__assign(__assign({ objectID: review.id }, lodash_1.pick(reviewData, reviewFields)), { user_email: userEmail, shop_id: product.shop_id, community_id: product.community_id, seller_id: product.user_id }));
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6:
                _b.trys.push([6, 13, , 14]);
                return [4 /*yield*/, reviewsIndex.saveObjects(reviewDocs)];
            case 7:
                _b.sent();
                return [4 /*yield*/, reviewsIndex.setSettings({
                        replicas: ['reviews_created_at_desc', 'reviews_rating_desc', 'reviews_rating_asc']
                    })];
            case 8:
                _b.sent();
                return [4 /*yield*/, reviewsIndex.setSettings({
                        searchableAttributes: ['message', 'user_email'],
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
                            'filterOnly(order_id)',
                            'filterOnly(product_id)',
                            'filterOnly(shop_id)',
                            'filterOnly(user_id)',
                            'filterOnly(community_id)',
                            'filterOnly(rating)',
                            'filterOnly(seller_id)',
                        ]
                    }, {
                        forwardToReplicas: true
                    })];
            case 9:
                _b.sent();
                return [4 /*yield*/, reviewsCreatedAtDescIndex.setSettings({
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
            case 10:
                _b.sent();
                return [4 /*yield*/, reviewsRatingAscIndex.setSettings({
                        ranking: [
                            'asc(rating)',
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
                _b.sent();
                return [4 /*yield*/, reviewsRatingDescIndex.setSettings({
                        ranking: [
                            'desc(rating)',
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
            case 12:
                _b.sent();
                console.log('reviews imported to algolia');
                return [3 /*break*/, 14];
            case 13:
                error_1 = _b.sent();
                console.error(error_1);
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports["default"] = importReviews;
