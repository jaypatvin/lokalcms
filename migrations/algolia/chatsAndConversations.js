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
var chatFields = [
    'archived',
    'chat_type',
    'community_id',
    'created_at',
    'customer_name',
    'last_message',
    'members',
    'shop_id',
    'product_id',
    'title',
    'updated_at',
];
var conversationFields = [
    'archived',
    'created_at',
    'media',
    'message',
    'sender_id',
    'sent_at',
    'reply_to',
    'updated_at',
    'community_id',
    'chat_id',
];
var importChatsAndConversations = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var chatsIndex, conversationsIndex, chatsRef, chatDocs, conversationDocs, _i, _a, chat, chatData, moreInfo, _b, _c, member, user, shop, product, conversationRef, _d, _e, doc, data, error_1;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                chatsIndex = client.initIndex('chats');
                conversationsIndex = client.initIndex('conversations');
                return [4 /*yield*/, db.collection('chats').get()];
            case 1:
                chatsRef = _f.sent();
                chatDocs = [];
                conversationDocs = [];
                _i = 0, _a = chatsRef.docs;
                _f.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 21];
                chat = _a[_i];
                chatData = chat.data();
                moreInfo = {
                    member_emails: []
                };
                _b = 0, _c = chatData.members;
                _f.label = 3;
            case 3:
                if (!(_b < _c.length)) return [3 /*break*/, 18];
                member = _c[_b];
                user = void 0;
                if (!(chatData.shop_id === member)) return [3 /*break*/, 8];
                return [4 /*yield*/, db.collection('shops').doc(chatData.shop_id).get()];
            case 4: return [4 /*yield*/, (_f.sent()).data()];
            case 5:
                shop = _f.sent();
                return [4 /*yield*/, db.collection('users').doc(shop.user_id).get()];
            case 6: return [4 /*yield*/, (_f.sent()).data()];
            case 7:
                user = _f.sent();
                return [3 /*break*/, 16];
            case 8:
                if (!(chatData.product_id === member)) return [3 /*break*/, 13];
                return [4 /*yield*/, db.collection('products').doc(chatData.product_id).get()];
            case 9: return [4 /*yield*/, (_f.sent()).data()];
            case 10:
                product = _f.sent();
                return [4 /*yield*/, db.collection('users').doc(product.user_id).get()];
            case 11: return [4 /*yield*/, (_f.sent()).data()];
            case 12:
                user = _f.sent();
                return [3 /*break*/, 16];
            case 13: return [4 /*yield*/, db.collection('users').doc(member).get()];
            case 14: return [4 /*yield*/, (_f.sent()).data()];
            case 15:
                user = _f.sent();
                _f.label = 16;
            case 16:
                if (user) {
                    moreInfo.member_emails.push(user.email);
                }
                _f.label = 17;
            case 17:
                _b++;
                return [3 /*break*/, 3];
            case 18:
                moreInfo.member_emails = lodash_1.uniq(moreInfo.member_emails);
                return [4 /*yield*/, db
                        .collection('chats')
                        .doc(chat.id)
                        .collection('conversation')
                        .get()];
            case 19:
                conversationRef = _f.sent();
                for (_d = 0, _e = conversationRef.docs; _d < _e.length; _d++) {
                    doc = _e[_d];
                    data = doc.data();
                    // const replyRef = data.reply_to ? await data.reply_to.get() : null
                    conversationDocs.push(__assign(__assign({ objectID: doc.id }, lodash_1.pick(data, conversationFields)), { chat_id: chat.id, community_id: chatData.community_id }));
                }
                chatDocs.push(__assign(__assign({ objectID: chat.id }, lodash_1.pick(chatData, chatFields)), moreInfo));
                _f.label = 20;
            case 20:
                _i++;
                return [3 /*break*/, 2];
            case 21:
                _f.trys.push([21, 26, , 27]);
                return [4 /*yield*/, chatsIndex.saveObjects(chatDocs)];
            case 22:
                _f.sent();
                return [4 /*yield*/, chatsIndex.setSettings({
                        searchableAttributes: ['member_emails', 'title'],
                        ranking: [
                            'desc(last_message.created_at._seconds)',
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
                            'filterOnly(chat_type)',
                            'filterOnly(community_id)',
                            'filterOnly(member_emails)',
                            'filterOnly(members)',
                            'filterOnly(product_id)',
                            'filterOnly(shop_id)',
                        ]
                    })];
            case 23:
                _f.sent();
                console.log('chats imported to algolia');
                return [4 /*yield*/, conversationsIndex.saveObjects(conversationDocs)];
            case 24:
                _f.sent();
                return [4 /*yield*/, conversationsIndex.setSettings({
                        searchableAttributes: ['message'],
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
                        ],
                        attributesForFaceting: [
                            'filterOnly(chat_id)',
                            'filterOnly(community_id)',
                            'filterOnly(sender_id)',
                        ]
                    })];
            case 25:
                _f.sent();
                console.log('conversations imported to algolia');
                return [3 /*break*/, 27];
            case 26:
                error_1 = _f.sent();
                console.error(error_1);
                return [3 /*break*/, 27];
            case 27: return [2 /*return*/];
        }
    });
}); };
exports["default"] = importChatsAndConversations;
