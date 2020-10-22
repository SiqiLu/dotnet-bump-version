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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const ActionContext_1 = require("./ActionContext");
const Bump_1 = require("./Bump");
const Commit_1 = require("./Commit");
function bumpVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        core.info("dotnet-bump-version action is running...");
        core.info("");
        const actionContext = new ActionContext_1.ActionContext(github.context);
        core.debug("Main.bumpVersion githubContext:");
        core.debug("Main.bumpVersion " + JSON.stringify(github.context));
        core.debug("Main.bumpVersion actionContext:");
        core.debug("Main.bumpVersion " +
            JSON.stringify({
                eventName: actionContext.eventName,
                sha: actionContext.sha,
                ref: actionContext.ref,
                branch: actionContext.branch,
                headCommit: actionContext.headCommit,
                pusher: actionContext.pusher,
            }));
        core.debug("Main.bumpVersion inputs:");
        core.debug("Main.bumpVersion " +
            JSON.stringify({
                versionFiles: actionContext.versionFiles,
                githubToken: actionContext.githubToken,
                pushChanges: actionContext.needPushChanges,
            }));
        // 只在 Github event 为 push 的时候生效
        if (github.context.eventName !== "push") {
            core.info('Github event is not "push", exit.');
            return;
        }
        core.debug(`Main.bumpVersion eventName: ${actionContext.eventName}`);
        core.debug(`Main.bumpVersion sha: ${actionContext.sha}`);
        core.debug(`Main.bumpVersion ref: ${actionContext.ref}`);
        core.debug(`Main.bumpVersion githubActor: ${actionContext.githubActor}`);
        core.debug(`Main.bumpVersion githubRepository: ${actionContext.githubRepository}`);
        core.debug(`Main.bumpVersion githubWorkspace: ${actionContext.githubWorkspace}`);
        core.debug(`Main.bumpVersion branch: ${actionContext.branch}`);
        core.debug(`Main.bumpVersion pusher: ${actionContext.pusher.name}`);
        core.debug(`Main.bumpVersion headCommit.id: ${actionContext.headCommit.id}`);
        core.debug(`Main.bumpVersion headCommit.message: ${actionContext.headCommit.message}`);
        core.debug(`Main.bumpVersion headCommit.timestamp: ${actionContext.headCommit.timestamp}`);
        // 替换 version file 中的 version
        const versionFiles = yield actionContext.getVersionFiles();
        core.info(`VersionFiles: ${JSON.stringify(versionFiles)}`);
        versionFiles.forEach(file => {
            const bump = new Bump_1.Bump(file, actionContext.headCommit.message);
            bump.bump();
        });
        // 推动更改
        if (actionContext.needPushChanges && actionContext.githubToken) {
            yield Commit_1.commit(versionFiles, actionContext, "Bump versions by dotnet-bump-version.", actionContext.githubToken);
        }
        core.debug("Finishing: dotnet-bump-version");
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield bumpVersion();
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run().catch(err => core.setFailed(err.message));
