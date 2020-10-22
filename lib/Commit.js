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
exports.commit = void 0;
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
exports.commit = (filesToCommit, eventContext, message, githubToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        core.info(`Committing changes with message "${message}".`);
        const remoteRepository = `https://${eventContext.githubActor}:${githubToken}@github.com/${eventContext.githubRepository}.git`;
        const options = {
            cwd: process.cwd(),
            listeners: {
                stdline: core.debug,
                stderr: core.debug,
                debug: core.debug,
            },
        };
        core.info("git status");
        yield exec_1.exec("git", ["status"], options);
        core.info(`git config user.name "${eventContext.pusher.name}"`);
        yield exec_1.exec("git", ["config", "user.name", `"${eventContext.pusher.name}"`], options);
        core.info(`git config user.email "${eventContext.pusher.email}"`);
        yield exec_1.exec("git", ["config", "user.email", `"${eventContext.pusher.email}"`], options);
        core.info(`git remote add publisher ${remoteRepository}`);
        yield exec_1.exec("git", ["remote", "add", "publisher", remoteRepository], options);
        // await exec('git', ['show-ref'], options)
        // await exec('git', ['branch', '--verbose'], options)
        // await exec("git", ["add", "-A"], options);
        // Issue #5
        // Only commit changed files 
        for (const file of filesToCommit) {
            core.info(`git add "${file}"`);
            yield exec_1.exec("git", ["add", file], options);
        }
        core.info("git status");
        yield exec_1.exec("git", ["status"], options);
        try {
            core.info(`git commit -m ${message}`);
            yield exec_1.exec("git", ["commit", "-m", `${message}`], options);
        }
        catch (err) {
            core.warning("nothing to commit");
            return;
        }
        core.info("git branch bump_tmp_");
        yield exec_1.exec("git", ["branch", "bump_tmp_"], options);
        core.info(`git checkout ${eventContext.branch}`);
        yield exec_1.exec("git", ["checkout", eventContext.branch], options);
        core.info("git merge bump_tmp_");
        yield exec_1.exec("git", ["merge", "bump_tmp_"], options);
        core.info(`git pull --no-edit --commit --strategy-option theirs publisher ${eventContext.branch}`);
        yield exec_1.exec("git", ["pull", "--no-edit", "--commit", "--strategy-option", "theirs", "publisher", eventContext.branch], options);
        core.info(`git push publisher ${eventContext.branch}`);
        yield exec_1.exec("git", ["push", "publisher", eventContext.branch], options);
    }
    catch (err) {
        core.error(err.message);
        core.setFailed(err.message);
        process.exit(1);
    }
});
