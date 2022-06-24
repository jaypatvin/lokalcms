"use strict";
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
/* eslint-disable import/first */
var admin = require("firebase-admin");
var functions = require("firebase-functions");
var algoliasearch_1 = require("algoliasearch");
var lodash_1 = require("lodash");
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
admin.initializeApp({ projectId: 'lokal-1baac' });
// lokal-app
// const appId = get(functions.config(), 'algolia_config.app_id', '4TDTSDE7AK')
// const apiKey = get(functions.config(), 'algolia_config.api_key', '0b4862933a12e4f86d0dbc45a2e53e9d')
// lokal-app-jet
var reviews_1 = require("./reviews");
var users_1 = require("./users");
var communities_1 = require("./communities");
var shopsAndProducts_1 = require("./shopsAndProducts");
var chatsAndConversations_1 = require("./chatsAndConversations");
var orders_1 = require("./orders");
var productSubscriptionPlans_1 = require("./productSubscriptionPlans");
var activitiesAndComments_1 = require("./activitiesAndComments");
var reports_1 = require("./reports");
var appId = lodash_1.get(functions.config(), 'algolia_config.app_id', '4DS4A9V4EM');
var apiKey = lodash_1.get(functions.config(), 'algolia_config.api_key', 'de79c046fa3f1680f68a74fd7cc5df42');
var client = algoliasearch_1["default"](appId, apiKey);
var clearAlgoliaIndex = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.listIndices().then(function (_a) {
                    var items = _a.items;
                    var _b = items.reduce(function (memo, _a) {
                        var name = _a.name, primary = _a.primary;
                        memo[primary ? 'primaryOps' : 'replicaOps'].push({
                            indexName: name,
                            action: 'delete'
                        });
                        return memo;
                    }, { primaryOps: [], replicaOps: [] }), primaryOps = _b.primaryOps, replicaOps = _b.replicaOps;
                    return client
                        .multipleBatch(primaryOps)
                        .wait()
                        .then(function () {
                        console.log('Done deleting primary indices');
                        return client.multipleBatch(replicaOps).then(function () {
                            console.log('Done deleting replica indices');
                        });
                    });
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var importToAlgolia = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // await clearAlgoliaIndex()
            return [4 /*yield*/, users_1["default"](client)];
            case 1:
                // await clearAlgoliaIndex()
                _a.sent();
                return [4 /*yield*/, communities_1["default"](client)];
            case 2:
                _a.sent();
                return [4 /*yield*/, shopsAndProducts_1["default"](client)];
            case 3:
                _a.sent();
                return [4 /*yield*/, chatsAndConversations_1["default"](client)];
            case 4:
                _a.sent();
                return [4 /*yield*/, orders_1["default"](client)];
            case 5:
                _a.sent();
                return [4 /*yield*/, productSubscriptionPlans_1["default"](client)];
            case 6:
                _a.sent();
                return [4 /*yield*/, activitiesAndComments_1["default"](client)];
            case 7:
                _a.sent();
                return [4 /*yield*/, reviews_1["default"](client)];
            case 8:
                _a.sent();
                return [4 /*yield*/, reports_1["default"](client)];
            case 9:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
importToAlgolia()["finally"](function () {
    process.exit();
});
