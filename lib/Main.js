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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const ActionContext_1 = require("./ActionContext");
const Bump_1 = require("./Bump");
const Commit_1 = require("./Commit");
function bumpVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        core.info("dotnet-bump-version 2028");
        core.info("dotnet-bump-version action is running...");
        core.info("");
        const actionContext = new ActionContext_1.ActionContext(github.context);
        core.debug("githubContext:");
        core.debug(JSON.stringify(github.context));
        core.debug("actionContext:");
        core.debug(JSON.stringify({
            eventName: actionContext.eventName,
            sha: actionContext.sha,
            ref: actionContext.ref,
            branch: actionContext.branch,
            headCommit: actionContext.headCommit,
            pusher: actionContext.pusher,
        }));
        core.debug("inputs:");
        core.debug(JSON.stringify({
            versionFiles: actionContext.versionFiles,
            githubToken: actionContext.githubToken,
            pushChanges: actionContext.needPushChanges,
        }));
        // 只在 Github event 为 push 的时候生效
        if (github.context.eventName !== "push") {
            core.info('Github event is not "push", exit.');
            return;
        }
        core.info(`eventName: ${actionContext.eventName}`);
        core.info(`sha: ${actionContext.sha}`);
        core.info(`ref: ${actionContext.ref}`);
        core.info(`githubActor: ${actionContext.githubActor}`);
        core.info(`githubRepository: ${actionContext.githubRepository}`);
        core.info(`githubWorkspace: ${actionContext.githubWorkspace}`);
        core.info(`branch: ${actionContext.branch}`);
        core.info(`pusher: ${actionContext.pusher.name}`);
        core.info(`headCommit.id: ${actionContext.headCommit.id}`);
        core.info(`headCommit.message: ${actionContext.headCommit.message}`);
        core.info(`headCommit.timestamp: ${actionContext.headCommit.timestamp}`);
        core.info("");
        // 替换 version file 中的 version
        const versionFiles = yield actionContext.getVersionFiles();
        core.info(`VersionFiles: ${JSON.stringify(versionFiles)}`);
        versionFiles.forEach(file => {
            const bump = new Bump_1.Bump(file, actionContext.headCommit.message);
            bump.bump();
        });
        // 推动更改
        if (actionContext.needPushChanges && actionContext.githubToken) {
            yield Commit_1.commit(actionContext, "Bump versions by dotnet-bump-version.", actionContext.githubToken);
        }
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
