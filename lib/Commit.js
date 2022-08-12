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
exports.commit = void 0;
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const commit = (filesToCommit, actionContext, message, githubToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        core.info(`Committing changes with message "${message}".`);
        const remoteRepository = `https://${actionContext.githubActor}:${githubToken}@github.com/${actionContext.githubRepository}.git`;
        const tempBranch = `bump_tmp_${actionContext.headCommit.id}`;
        const options = {
            cwd: process.cwd(),
            listeners: {
                stdline: core.debug,
                stderr: core.debug,
                debug: core.debug
            }
        };
        core.info("git status");
        yield (0, exec_1.exec)("git", ["status"], options);
        core.info(`git config user.name "${actionContext.pusher.name}"`);
        yield (0, exec_1.exec)("git", ["config", "user.name", `"${actionContext.pusher.name}"`], options);
        core.info(`git config user.email "${actionContext.pusher.email}"`);
        yield (0, exec_1.exec)("git", ["config", "user.email", `"${actionContext.pusher.email}"`], options);
        // Issue #10
        // While Git was updated from 2.33.0 to 2.33.1, need to specify how to reconcile divergent branches.
        core.info(`git config pull.rebase false`);
        yield (0, exec_1.exec)("git", ["config", "pull.rebase", `false`], options);
        core.info(`git remote add publisher ${remoteRepository}`);
        yield (0, exec_1.exec)("git", ["remote", "add", "publisher", remoteRepository], options);
        core.info(`git branch ${tempBranch}`);
        yield (0, exec_1.exec)("git", ["branch", tempBranch], options);
        core.info(`git merge ${actionContext.branch}`);
        yield (0, exec_1.exec)("git", ["merge", actionContext.branch], options);
        // Issue #5
        // Only commit changed files
        for (const file of filesToCommit) {
            core.info(`git add "${file}"`);
            yield (0, exec_1.exec)("git", ["add", file], options);
        }
        core.info("git status");
        yield (0, exec_1.exec)("git", ["status"], options);
        try {
            core.info(`git commit -m "${message}"`);
            yield (0, exec_1.exec)("git", ["commit", "-m", `${message}`], options);
        }
        catch (error) {
            if (error instanceof Error) {
                core.warning(`Warning: git commit failed. The error message is ${error.message}`);
                core.warning(`Warning: git push will be skipped.`);
            }
            return;
        }
        core.info(`git checkout ${actionContext.branch}`);
        yield (0, exec_1.exec)("git", ["checkout", actionContext.branch], options);
        core.info(`git pull --no-edit --commit --strategy-option theirs publisher ${actionContext.branch}`);
        yield (0, exec_1.exec)("git", ["pull", "--no-edit", "--commit", "--strategy-option", "theirs", "publisher", actionContext.branch], options);
        core.info(`git merge ${tempBranch}`);
        yield (0, exec_1.exec)("git", ["merge", tempBranch], options);
        core.info(`git push publisher ${actionContext.branch}`);
        yield (0, exec_1.exec)("git", ["push", "publisher", actionContext.branch], options);
    }
    catch (error) {
        if (error instanceof Error) {
            core.error(error.message);
            core.setFailed(error.message);
        }
        process.exit(1);
    }
});
exports.commit = commit;
