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
var activityFields = [
    '_meta',
    'archived',
    'archived_at',
    'community_id',
    'created_at',
    'images',
    'message',
    'status',
    'updated_at',
    'user_id',
];
var commentFields = [
    'archived',
    'archived_at',
    'activity_id',
    'community_id',
    'created_at',
    'images',
    'message',
    'status',
    'updated_at',
    'user_id',
];
var importActivitiesAndComments = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var activitiesIndex, activitiesCreatedAtDescIndex, commentsIndex, commentsCreatedAtDescIndex, activitiesRef, activityDocs, commentDocs, _i, _a, activity, activityData, commentsRef, _b, _c, comment, commentData, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                activitiesIndex = client.initIndex('activities');
                activitiesCreatedAtDescIndex = client.initIndex('activities_created_at_desc');
                commentsIndex = client.initIndex('comments');
                commentsCreatedAtDescIndex = client.initIndex('comments_created_at_desc');
                return [4 /*yield*/, db.collection('activities').get()];
            case 1:
                activitiesRef = _d.sent();
                activityDocs = [];
                commentDocs = [];
                _i = 0, _a = activitiesRef.docs;
                _d.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                activity = _a[_i];
                activityData = activity.data();
                activityDocs.push(__assign({ objectID: activity.id }, lodash_1.pick(activityData, activityFields)));
                return [4 /*yield*/, db.collection('activities').doc(activity.id).collection('comments').get()];
            case 3:
                commentsRef = _d.sent();
                for (_b = 0, _c = commentsRef.docs; _b < _c.length; _b++) {
                    comment = _c[_b];
                    commentData = comment.data();
                    commentDocs.push(__assign(__assign({ objectID: comment.id }, lodash_1.pick(commentData, commentFields)), { activity_id: activity.id }));
                }
                _d.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                _d.trys.push([5, 14, , 15]);
                return [4 /*yield*/, activitiesIndex.saveObjects(activityDocs)];
            case 6:
                _d.sent();
                return [4 /*yield*/, activitiesIndex.setSettings({
                        replicas: ['activities_created_at_desc']
                    })];
            case 7:
                _d.sent();
                return [4 /*yield*/, activitiesIndex.setSettings({
                        searchableAttributes: [
                            'message',
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
                            'filterOnly(archived)',
                            'filterOnly(community_id)',
                            'filterOnly(status)',
                            'filterOnly(user_id)',
                        ]
                    }, {
                        forwardToReplicas: true
                    })];
            case 8:
                _d.sent();
                return [4 /*yield*/, activitiesCreatedAtDescIndex.setSettings({
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
            case 9:
                _d.sent();
                console.log('activities imported to algolia');
                return [4 /*yield*/, commentsIndex.saveObjects(commentDocs)];
            case 10:
                _d.sent();
                return [4 /*yield*/, commentsIndex.setSettings({
                        replicas: ['comments_created_at_desc']
                    })];
            case 11:
                _d.sent();
                return [4 /*yield*/, commentsIndex.setSettings({
                        searchableAttributes: [
                            'message',
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
                            'filterOnly(archived)',
                            'filterOnly(activity_id)',
                            'filterOnly(status)',
                            'filterOnly(user_id)',
                        ]
                    }, {
                        forwardToReplicas: true
                    })];
            case 12:
                _d.sent();
                return [4 /*yield*/, commentsCreatedAtDescIndex.setSettings({
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
            case 13:
                _d.sent();
                console.log('comments imported to algolia');
                return [3 /*break*/, 15];
            case 14:
                error_1 = _d.sent();
                console.error(error_1);
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); };
exports["default"] = importActivitiesAndComments;
