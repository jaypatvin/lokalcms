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
var reportFields = [
    'user_id',
    'reported_user_id',
    'description',
    'community_id',
    'activity_id',
    'shop_id',
    'product_id',
    'created_at',
    'updated_at',
    'report_type',
    'document_snapshot',
    'reporter_email',
    'reported_email',
];
var importReports = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var reportsIndex, reportsRef, reportDocs, _i, _a, report, reportData, userRef, reportedUserRef, userEmail, reportedUserEmail, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                reportsIndex = client.initIndex('reports');
                return [4 /*yield*/, db.collectionGroup('reports').get()];
            case 1:
                reportsRef = _b.sent();
                reportDocs = [];
                _i = 0, _a = reportsRef.docs;
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                report = _a[_i];
                reportData = report.data();
                return [4 /*yield*/, db.collection('users').doc(reportData.user_id).get()];
            case 3:
                userRef = _b.sent();
                return [4 /*yield*/, db.collection('users').doc(reportData.reported_user_id).get()];
            case 4:
                reportedUserRef = _b.sent();
                userEmail = userRef.data().email;
                reportedUserEmail = reportedUserRef.data().email;
                reportDocs.push(__assign(__assign({ objectID: report.id }, lodash_1.pick(reportData, reportFields)), { reporter_email: userEmail, reported_email: reportedUserEmail }));
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6:
                _b.trys.push([6, 9, , 10]);
                return [4 /*yield*/, reportsIndex.saveObjects(reportDocs)];
            case 7:
                _b.sent();
                return [4 /*yield*/, reportsIndex.setSettings({
                        searchableAttributes: [
                            'description',
                            'reported_email',
                            'reporter_email',
                            'document_snapshot.name',
                            'document_snapshot.message',
                        ],
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
                            'filterOnly(activity_id)',
                            'filterOnly(community_id)',
                            'filterOnly(product_id)',
                            'filterOnly(report_type)',
                            'filterOnly(reported_user_id)',
                            'filterOnly(shop_id)',
                            'filterOnly(user_id)',
                        ]
                    })];
            case 8:
                _b.sent();
                console.log('reports imported to algolia');
                return [3 /*break*/, 10];
            case 9:
                error_1 = _b.sent();
                console.error(error_1);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports["default"] = importReports;
