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
exports.Inputs = void 0;
const core = __importStar(require("@actions/core"));
const globby = __importStar(require("globby"));
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
        this._overwriteBuildRex = /^[^\.\s]*\.[^\.\s]*\.[^\.\s]*\.([^\.\s])*$/;
        core.info("Inputs initializing...");
        this._versionFiles = this.getVersionFiles();
        core.info(`Inputs.versionMask: ${this.versionMask}`);
        core.info(`Inputs.bumpMajor: ${this.bumpMajor.toString()}`);
        core.info(`Inputs.bumpMinor: ${this.bumpMinor.toString()}`);
        core.info(`Inputs.bumpPatch: ${this.bumpPatch.toString()}`);
        core.info(`Inputs.bumpBuild: ${this.bumpBuild.toString()}`);
        core.info(`Inputs.versionOverwrite: ${this.versionOverwrite}`);
        core.info(`Inputs.overwriteMajor: ${this.overwriteMajor.toString()} (${this.overwriteMajorString})`);
        core.info(`Inputs.overwriteMinor: ${this.overwriteMinor.toString()} (${this.overwriteMinorString})`);
        core.info(`Inputs.overwritePatch: ${this.overwritePatch.toString()} (${this.overwritePatchString})`);
        core.info(`Inputs.overwriteBuild: ${this.overwriteBuild.toString()} (${this.overwriteBuildString})`);
        core.info(`Inputs.needPushChanges: ${this.needPushChanges.toString()}`);
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
        const matches = this._overwriteMajorRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString() != "*";
        }
        return false;
    }
    get overwriteMinor() {
        const matches = this._overwriteMinorRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString() != "*";
        }
        return false;
    }
    get overwritePatch() {
        const matches = this._overwritePatchRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString() != "*";
        }
        return false;
    }
    get overwriteBuild() {
        const matches = this._overwriteBuildRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString() != "*";
        }
        return false;
    }
    get overwriteMajorString() {
        const matches = this._overwriteMajorRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString();
        }
        return "";
    }
    get overwriteMinorString() {
        const matches = this._overwriteMinorRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString();
        }
        return "";
    }
    get overwritePatchString() {
        const matches = this._overwritePatchRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString();
        }
        return "";
    }
    get overwriteBuildString() {
        const matches = this._overwriteBuildRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString();
        }
        return "";
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
        if (this._versionFiles.length > 0) {
            return this._versionFiles;
        }
        const versionFilesPatterns = this.versionFiles;
        core.debug(`Inputs.versionFilesPatternsString: ${versionFilesPatterns}`);
        let patterns = [];
        if (Inputs._isJsonArray(versionFilesPatterns)) {
            core.debug("Inputs.getVersionFiles versionFilesPatterns isJsonArray: true");
            patterns = JSON.parse(versionFilesPatterns);
        }
        else if (typeof versionFilesPatterns == "string" && versionFilesPatterns) {
            core.debug("Inputs.getVersionFiles versionFilesPatterns isJsonArray: false");
            patterns = [versionFilesPatterns];
        }
        core.debug(`Inputs.versionFilesPatterns: ${JSON.stringify(patterns)}`);
        this._versionFiles = globby.globbySync(patterns, {
            gitignore: true,
            expandDirectories: true,
            onlyFiles: true,
            ignore: [],
            cwd: process.cwd()
        });
        core.debug(`Inputs.versionFiles: ${JSON.stringify(this._versionFiles)}`);
        return this._versionFiles;
    }
}
exports.Inputs = Inputs;
Inputs._instance = new Inputs();
