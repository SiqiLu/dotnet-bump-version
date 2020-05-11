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
const exec_1 = require("@actions/exec");
exports.commit = (eventContext, message, githubToken) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield exec_1.exec("git", ["config", "user.name", `"${eventContext.pusher.name}"`], options);
        yield exec_1.exec("git", ["config", "user.email", `"${eventContext.pusher.email}"`], options);
        yield exec_1.exec("git", ["remote", "add", "publisher", remoteRepository], options);
        // await exec('git', ['show-ref'], options)
        // await exec('git', ['branch', '--verbose'], options)
        yield exec_1.exec("git", ["add", "-A"], options);
        try {
            yield exec_1.exec("git", ["commit", "-m", `${message}`], options);
            yield exec_1.exec("git", ["log", "-5", "--pretty=oneline"], options);
        }
        catch (err) {
            core.debug("nothing to commit");
            return;
        }
        yield exec_1.exec("git", ["branch", "bump_tmp_"], options);
        yield exec_1.exec("git", ["checkout", eventContext.branch], options);
        yield exec_1.exec("git", ["merge", "bump_tmp_"], options);
        yield exec_1.exec("git", ["pull", "--no-edit", "--commit", "--strategy-option", "theirs", "publisher", eventContext.branch], options);
        yield exec_1.exec("git", ["push", "publisher", eventContext.branch], options);
    }
    catch (err) {
        core.error(err.message);
        core.setFailed(err.message);
        process.exit(1);
    }
});
