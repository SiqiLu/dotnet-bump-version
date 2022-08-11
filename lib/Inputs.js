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
exports.Inputs = void 0;
const core = __importStar(require("@actions/core"));
class Inputs {
    constructor() {
        this._defaultVersionFiles = "**/*.csproj";
        this._defaultVersionMask = "0.0.1.0";
        this._defaultVersionOverwrite = "*.*.*.*";
        this._bumpMajorRex = /^1\.[0-1]\.[0-1]\.[0-1]$/;
        this._bumpMinorRex = /^[0-1]\.1\.[0-1]\.[0-1]$/;
        this._bumpPatchRex = /^[0-1]\.[0-1]\.1\.[0-1]$/;
        this._bumpBuildRex = /^[0-1]\.[0-1]\.[0-1]\.1$/;
        this._overwriteMajorRex = /^([^\.\s]*)\.[^\.\s]*\.[^\.\s]*\.[^\.\s]*$/;
        this._overwriteMinorRex = /^[^\.\s]*\.([^\.\s]*)\.[^\.\s]*\.[^\.\s]*$/;
        this._overwritePatchRex = /^[^\.\s]*\.[^\.\s]*\.([^\.\s]*)\.[^\.\s]*$/;
        this._overwriteBuildRex = /^[^\.\s]*\.[^\.\s]*\.[^\.\s]*\.([^\.\s]*)$/;
        this._overwriteMajor = null;
        this._overwriteMinor = null;
        this._overwritePatch = null;
        this._overwriteBuild = null;
        this._overwriteMajorString = null;
        this._overwriteMinorString = null;
        this._overwritePatchString = null;
        this._overwriteBuildString = null;
        this._versionFiles = [];
        core.info("Inputs initializing...");
        core.info("");
        core.info(`Inputs.versionFiles: ${this.versionFiles}`);
        core.info(`Inputs.versionFilesPatterns: ${JSON.stringify(this.versionFilesPatterns)}`);
        core.info("");
        core.info(`Inputs.versionMask: ${this.versionMask}`);
        core.info(`Inputs.bumpMajor: ${this.bumpMajor.toString()}`);
        core.info(`Inputs.bumpMinor: ${this.bumpMinor.toString()}`);
        core.info(`Inputs.bumpPatch: ${this.bumpPatch.toString()}`);
        core.info(`Inputs.bumpBuild: ${this.bumpBuild.toString()}`);
        core.info("");
        core.info(`Inputs.versionOverwrite: ${this.versionOverwrite}`);
        core.info(`Inputs.overwriteMajor: ${this.overwriteMajor.toString()} (${this.overwriteMajorString})`);
        core.info(`Inputs.overwriteMinor: ${this.overwriteMinor.toString()} (${this.overwriteMinorString})`);
        core.info(`Inputs.overwritePatch: ${this.overwritePatch.toString()} (${this.overwritePatchString})`);
        core.info(`Inputs.overwriteBuild: ${this.overwriteBuild.toString()} (${this.overwriteBuildString})`);
        core.info("");
        core.info(`Inputs.needPushChanges: ${this.needPushChanges.toString()}`);
        core.info("");
    }
    static get current() {
        return Inputs._instance;
    }
    get versionFiles() {
        return core.getInput("version_files") || this._defaultVersionFiles;
    }
    get versionMask() {
        return core.getInput("version_mask") || this._defaultVersionMask;
    }
    get versionOverwrite() {
        return core.getInput("version_overwrite") || this._defaultVersionOverwrite;
    }
    get githubToken() {
        return core.getInput("github_token") || "";
    }
    get versionFilesPatterns() {
        let patterns = [];
        if (Inputs._isJsonArray(this.versionFiles)) {
            patterns = JSON.parse(this.versionFiles);
        }
        else if (typeof this.versionFiles == "string" && this.versionFiles) {
            patterns = [this.versionFiles];
        }
        return patterns;
    }
    get bumpMajor() {
        return this._bumpMajorRex.test(this.versionMask);
    }
    get bumpMinor() {
        return this._bumpMinorRex.test(this.versionMask);
    }
    get bumpPatch() {
        return this._bumpPatchRex.test(this.versionMask);
    }
    get bumpBuild() {
        return this._bumpBuildRex.test(this.versionMask);
    }
    get needOverwriteVersion() {
        return this.overwriteMajor || this.overwriteMinor || this.overwritePatch || this.overwriteBuild;
    }
    get overwriteMajor() {
        if (this._overwriteMajor != null) {
            return this._overwriteMajor;
        }
        const matches = this._overwriteMajorRex.exec(this.versionOverwrite);
        core.debug("Inputs.overwriteMajor RexMatches: " + JSON.stringify(matches !== null && matches !== void 0 ? matches : "null"));
        if (matches && matches.length >= 2) {
            return (this._overwriteMajor = matches[1].toString() != "*");
        }
        return (this._overwriteMajor = false);
    }
    get overwriteMinor() {
        if (this._overwriteMinor != null) {
            return this._overwriteMinor;
        }
        const matches = this._overwriteMinorRex.exec(this.versionOverwrite);
        core.debug("Inputs.overwriteMinor RexMatches: " + JSON.stringify(matches !== null && matches !== void 0 ? matches : "null"));
        if (matches && matches.length >= 2) {
            return (this._overwriteMinor = matches[1].toString() != "*");
        }
        return (this._overwriteMinor = false);
    }
    get overwritePatch() {
        if (this._overwritePatch != null) {
            return this._overwritePatch;
        }
        const matches = this._overwritePatchRex.exec(this.versionOverwrite);
        core.debug("Inputs.overwritePatch RexMatches: " + JSON.stringify(matches !== null && matches !== void 0 ? matches : "null"));
        if (matches && matches.length >= 2) {
            return (this._overwritePatch = matches[1].toString() != "*");
        }
        return (this._overwritePatch = false);
    }
    get overwriteBuild() {
        if (this._overwriteBuild != null) {
            return this._overwriteBuild;
        }
        const matches = this._overwriteBuildRex.exec(this.versionOverwrite);
        core.debug("Inputs.overwriteBuild RexMatches: " + JSON.stringify(matches !== null && matches !== void 0 ? matches : "null"));
        if (matches && matches.length >= 2) {
            return (this._overwriteBuild = matches[1].toString() != "*");
        }
        return (this._overwriteBuild = false);
    }
    get overwriteMajorString() {
        if (this._overwriteMajorString != null) {
            return this._overwriteMajorString;
        }
        const matches = this._overwriteMajorRex.exec(this.versionOverwrite);
        core.debug("Inputs.overwriteMajorString RexMatches: " + JSON.stringify(matches !== null && matches !== void 0 ? matches : "null"));
        if (matches && matches.length >= 2) {
            return (this._overwriteMajorString = matches[1].toString());
        }
        return (this._overwriteMajorString = "");
    }
    get overwriteMinorString() {
        if (this._overwriteMinorString != null) {
            return this._overwriteMinorString;
        }
        const matches = this._overwriteMinorRex.exec(this.versionOverwrite);
        core.debug("Inputs.overwriteMinorString RexMatches: " + JSON.stringify(matches !== null && matches !== void 0 ? matches : "null"));
        if (matches && matches.length >= 2) {
            return (this._overwriteMinorString = matches[1].toString());
        }
        return (this._overwriteMinorString = "");
    }
    get overwritePatchString() {
        if (this._overwritePatchString != null) {
            return this._overwritePatchString;
        }
        const matches = this._overwritePatchRex.exec(this.versionOverwrite);
        core.debug("Inputs.overwritePatchString RexMatches: " + JSON.stringify(matches !== null && matches !== void 0 ? matches : "null"));
        if (matches && matches.length >= 2) {
            return (this._overwritePatchString = matches[1].toString());
        }
        return (this._overwritePatchString = "");
    }
    get overwriteBuildString() {
        if (this._overwriteBuildString != null) {
            return this._overwriteBuildString;
        }
        const matches = this._overwriteBuildRex.exec(this.versionOverwrite);
        core.debug("Inputs.overwriteBuildString RexMatches: " + JSON.stringify(matches !== null && matches !== void 0 ? matches : "null"));
        if (matches && matches.length >= 2) {
            return (this._overwriteBuildString = matches[1].toString());
        }
        return (this._overwriteBuildString = "");
    }
    get needPushChanges() {
        return this.githubToken.length > 0 ? true : false;
    }
    static _isJson(str) {
        if (typeof str == "string") {
            try {
                const obj = JSON.parse(str);
                if (obj != null && typeof obj == "object") {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                // Is is not a json.
                return false;
            }
        }
        // It is not a string!
        return false;
    }
    static _isJsonArray(str) {
        if (typeof str == "string") {
            try {
                const obj = JSON.parse(str);
                if (obj != null && Array.isArray(obj)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                // Is is not a json array.
                return false;
            }
        }
        // It is not a string!
        return false;
    }
    getVersionFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._versionFiles.length > 0) {
                return this._versionFiles;
            }
            const globby = yield import("globby");
            this._versionFiles = yield globby.globby(this.versionFilesPatterns, {
                gitignore: true,
                expandDirectories: true,
                onlyFiles: true,
                ignore: [],
                cwd: process.cwd()
            });
            core.debug(`Inputs.versionFiles: ${JSON.stringify(this._versionFiles)}`);
            return this._versionFiles;
        });
    }
}
exports.Inputs = Inputs;
Inputs._instance = new Inputs();
