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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const ActionContext_1 = require("./ActionContext");
const Bump_1 = require("./Bump");
const Commit_1 = require("./Commit");
function bumpVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        core.info("dotnet-bump-version action is running...");
        core.info("");
        const inputs = (yield import("./Inputs.js")).Inputs.current;
        const githubContext = github.context;
        const actionContext = new ActionContext_1.ActionContext(githubContext);
        // 只在 Github event 为 push 的时候生效
        if (github.context.eventName !== "push") {
            core.info(`Github event is ${github.context.eventName} and not "push", exit.`);
            return;
        }
        // 替换 version file 中的 version
        const versionFiles = yield inputs.getVersionFiles();
        core.info("versionFiles:");
        core.info(JSON.stringify(versionFiles));
        core.info("");
        // Issue #5
        // Only commit changed files
        let bumpedFiles = versionFiles.filter(file => {
            const bump = new Bump_1.Bump(file, actionContext.headCommit.message, inputs);
            return bump.bump();
        });
        // push changes
        if (inputs.needPushChanges && inputs.githubToken && bumpedFiles.length > 0) {
            yield (0, Commit_1.commit)(bumpedFiles, actionContext, "Bump versions by dotnet-bump-version.", inputs.githubToken);
        }
        core.info("dotnet-bump-version action is finishing...");
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield bumpVersion();
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
        }
    });
}
run().catch(error => {
    if (error instanceof Error) {
        core.setFailed(error.message);
    }
});
