"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionContext = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const globby = __importStar(require("globby"));
const os_1 = require("os");
class ActionContext {
    constructor(githubContext) {
        this.githubContext = githubContext;
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
            if (fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
                this.payload = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }));
            }
            else {
                const eventPath = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${eventPath} does not exist${os_1.EOL}`);
                throw new Error(`GITHUB_EVENT_PATH ${eventPath} does not exist${os_1.EOL}`);
            }
        }
    }
    getVersionFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const versionFilesStr = core.getInput("version_files") || "**/*.csproj";
            core.debug(`ActionContext.getVersionFiles versionFilesStr: ${versionFilesStr}`);
            let patterns = [];
            if (ActionContext.isJsonArray(versionFilesStr) && versionFilesStr) {
                core.debug(`ActionContext.getVersionFiles versionFilesStr isJsonArray: ${ActionContext.isJsonArray(versionFilesStr)}`);
                patterns = JSON.parse(versionFilesStr);
            }
            else if (typeof versionFilesStr == "string" && versionFilesStr) {
                patterns = [versionFilesStr];
            }
            core.debug(`ActionContext.getVersionFiles versionFilesStr patterns: ${JSON.stringify(patterns)}`);
            const versionFiles = yield globby.default(patterns, {
                gitignore: true,
                expandDirectories: true,
                onlyFiles: true,
                ignore: [],
                cwd: process.cwd(),
            });
            core.debug(`ActionContext.getVersionFiles _versionFiles: ${JSON.stringify(versionFiles)}`);
            return versionFiles;
        });
    }
    get eventName() {
        return this.githubContext.eventName;
    }
    get sha() {
        return this.githubContext.sha;
    }
    get ref() {
        return this.githubContext.ref;
    }
    get githubActor() {
        return process.env.GITHUB_ACTOR || "";
    }
    get githubRepository() {
        return process.env.GITHUB_REPOSITORY || "";
    }
    get githubWorkspace() {
        return process.env.GITHUB_REPOSITORY || "";
    }
    get branch() {
        return process.env.BRANCH || this.ref.substr("refs/heads/".length) || "";
    }
    get headCommit() {
        return {
            id: this.payload.head_commit.id.toString(),
            message: this.payload.head_commit.message.toString(),
            timestamp: this.payload.head_commit.timestamp.toString(),
            url: this.payload.head_commit.url.toString(),
            committerName: this.payload.head_commit.committer.name.toString(),
            committerEmail: this.payload.head_commit.committer.email.toString(),
            committerUserName: this.payload.head_commit.committer.username.toString(),
        };
    }
    get pusher() {
        return {
            name: this.payload.pusher.name.toString(),
            email: this.payload.pusher.email.toString(),
        };
    }
    get versionFiles() {
        return core.getInput("version_files");
    }
    get githubToken() {
        return core.getInput("github_token");
    }
    get needPushChanges() {
        return this.githubToken ? true : false;
    }
    static isJson(str) {
        if (typeof str == "string") {
            try {
                const obj = JSON.parse(str);
                if (typeof obj == "object" && obj) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                // Is is not a json.
                return false;
            }
        }
        // It is not a string!
        return false;
    }
    static isJsonArray(str) {
        if (typeof str == "string") {
            try {
                const obj = JSON.parse(str);
                if (Array.isArray(obj) && obj) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                // Is is not a json.
                return false;
            }
        }
        // It is not a string!
        return false;
    }
    static readFiles(dirPath) {
        const fileOrDir = fs.readdirSync(dirPath, "utf8");
        fileOrDir.forEach(e => {
            const fileOrDirPath = path.join(dirPath, e);
            if (fs.statSync(fileOrDirPath).isFile()) {
                core.debug(fileOrDirPath);
            }
            if (fs.statSync(fileOrDirPath).isDirectory()) {
                this.readFiles(fileOrDirPath);
            }
        });
    }
}
exports.ActionContext = ActionContext;
