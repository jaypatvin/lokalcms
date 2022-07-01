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
var userFields = [
    '_meta',
    'address',
    'archived',
    'birthdate',
    'community_id',
    'created_at',
    'display_name',
    'email',
    'first_name',
    'last_name',
    'profile_photo',
    'registration',
    'roles',
    'status',
    'updated_at',
];
var importUsers = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var usersIndex, usersNameDescIndex, usersCreatedAtAscIndex, usersCreatedAtDescIndex, usersRef, userDocs, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                usersIndex = client.initIndex('users');
                usersNameDescIndex = client.initIndex('users_name_desc');
                usersCreatedAtAscIndex = client.initIndex('users_created_at_asc');
                usersCreatedAtDescIndex = client.initIndex('users_created_at_desc');
                return [4 /*yield*/, db.collection('users').get()];
            case 1:
                usersRef = _a.sent();
                userDocs = usersRef.docs.map(function (doc) {
                    var userData = doc.data();
                    return __assign({ objectID: doc.id }, lodash_1.pick(userData, userFields));
                });
                _a.label = 2;
            case 2:
                _a.trys.push([2, 9, , 10]);
                return [4 /*yield*/, usersIndex.saveObjects(userDocs)];
            case 3:
                _a.sent();
                return [4 /*yield*/, usersIndex.setSettings({
                        replicas: ['users_name_desc', 'users_created_at_desc', 'users_created_at_asc']
                    })];
            case 4:
                _a.sent();
                return [4 /*yield*/, usersIndex.setSettings({
                        searchableAttributes: [
                            'address.street',
                            'display_name',
                            'email',
                            'first_name',
                            'last_name',
                        ],
                        ranking: [
                            'asc(display_name)',
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
                            'filterOnly(archived)',
                            'filterOnly(community_id)',
                            'filterOnly(roles.admin)',
                            'filterOnly(roles.editor)',
                            'filterOnly(status)',
                        ]
                    }, {
                        forwardToReplicas: true
                    })];
            case 5:
                _a.sent();
                return [4 /*yield*/, usersNameDescIndex.setSettings({
                        ranking: [
                            'desc(display_name)',
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
                _a.sent();
                return [4 /*yield*/, usersCreatedAtAscIndex.setSettings({
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
            case 7:
                _a.sent();
                return [4 /*yield*/, usersCreatedAtDescIndex.setSettings({
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
            case 8:
                _a.sent();
                console.log('users imported to algolia');
                return [3 /*break*/, 10];
            case 9:
                error_1 = _a.sent();
                console.error(error_1);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports["default"] = importUsers;
