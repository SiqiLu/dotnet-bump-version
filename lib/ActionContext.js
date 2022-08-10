"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionContext = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const os_1 = require("os");
class ActionContext {
    constructor(githubContext) {
        this._githubContext = githubContext;
        if (process.env.GITHUB_EVENT_PATH != null) {
            if (fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
                let githubEvent = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }));
                core.debug("///    githubEvent:");
                core.debug("///    " + JSON.stringify(githubEvent));
                core.debug("");
                this._payload = githubEvent;
            }
            else {
                const eventPath = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${eventPath} does not exist${os_1.EOL}`);
                throw new Error(`GITHUB_EVENT_PATH ${eventPath} does not exist${os_1.EOL}`);
            }
        }
    }
    get eventName() {
        return this._githubContext.eventName;
    }
    get sha() {
        return this._githubContext.sha;
    }
    get ref() {
        return this._githubContext.ref;
    }
    get githubActor() {
        var _a;
        return (_a = process.env.GITHUB_ACTOR) !== null && _a !== void 0 ? _a : "";
    }
    get githubRepository() {
        var _a;
        return (_a = process.env.GITHUB_REPOSITORY) !== null && _a !== void 0 ? _a : "";
    }
    get githubWorkspace() {
        var _a;
        return (_a = process.env.GITHUB_REPOSITORY) !== null && _a !== void 0 ? _a : "";
    }
    get branch() {
        var _a;
        return (_a = process.env.BRANCH) !== null && _a !== void 0 ? _a : this.ref.substring(0, "refs/heads/".length);
    }
    get headCommit() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return {
            id: (_b = (_a = this._payload) === null || _a === void 0 ? void 0 : _a.head_commit.id.toString()) !== null && _b !== void 0 ? _b : "",
            message: (_d = (_c = this._payload) === null || _c === void 0 ? void 0 : _c.head_commit.message.toString()) !== null && _d !== void 0 ? _d : "",
            timestamp: (_f = (_e = this._payload) === null || _e === void 0 ? void 0 : _e.head_commit.timestamp.toString()) !== null && _f !== void 0 ? _f : "",
            url: (_h = (_g = this._payload) === null || _g === void 0 ? void 0 : _g.head_commit.url.toString()) !== null && _h !== void 0 ? _h : "",
            committerName: (_k = (_j = this._payload) === null || _j === void 0 ? void 0 : _j.head_commit.committer.name.toString()) !== null && _k !== void 0 ? _k : "",
            committerEmail: (_m = (_l = this._payload) === null || _l === void 0 ? void 0 : _l.head_commit.committer.email.toString()) !== null && _m !== void 0 ? _m : "",
            committerUserName: (_p = (_o = this._payload) === null || _o === void 0 ? void 0 : _o.head_commit.committer.username.toString()) !== null && _p !== void 0 ? _p : ""
        };
    }
    get pusher() {
        var _a, _b, _c, _d;
        return {
            name: (_b = (_a = this._payload) === null || _a === void 0 ? void 0 : _a.pusher.name.toString()) !== null && _b !== void 0 ? _b : "",
            email: (_d = (_c = this._payload) === null || _c === void 0 ? void 0 : _c.pusher.email.toString()) !== null && _d !== void 0 ? _d : ""
        };
    }
}
exports.ActionContext = ActionContext;
