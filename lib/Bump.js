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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bump = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
class Bump {
    constructor(file, message) {
        this.versionRex = /<Version>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/Version>/i;
        this.packageVersionRex = /<PackageVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/PackageVersion>/i;
        this.assemblyVersionRex = /<AssemblyVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/AssemblyVersion>/i;
        this.fileVersionRex = /<FileVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/FileVersion>/i;
        this.informationalVersionRex = /<InformationalVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/InformationalVersion>/gi;
        this.versions = new Map([
            ["Version", this.versionRex],
            ["PackageVersion", this.packageVersionRex],
            ["AssemblyVersion", this.assemblyVersionRex],
            ["FileVersion", this.fileVersionRex],
            ["InformationalVersion", this.informationalVersionRex],
        ]);
        this.optionsRex = /(--(major)|--(minor)|--(patch))/i;
        this.file = file;
        this.message = message;
    }
    bump() {
        let options = "build";
        const optionsMatches = this.optionsRex.exec(this.message);
        core.debug(`Bump.bump optionsMatches: ${JSON.stringify(optionsMatches)}`);
        if (optionsMatches && optionsMatches.length >= 3) {
            options = optionsMatches[1].toString();
        }
        core.debug(`Bump.bump options: ${JSON.stringify(options)}`);
        const originContent = fs.readFileSync(this.file, "utf8").toString();
        core.debug(`Bump.bump originContent: ${originContent}`);
        var bumppedContent = originContent.trim();
        var modified = false;
        this.versions.forEach((v, k) => {
            const matches = v.exec(bumppedContent);
            core.debug(`Bump.bump matches: ${JSON.stringify(matches)}`);
            if (matches && matches.length === 6) {
                const originVersion = matches[1].toString();
                core.debug(`Bump.bump ${k}.originVersion: ${originVersion}`);
                const bumppedVersion = Bump.bumpVersion(matches, options);
                core.debug(`Bump.bump ${k}.bumppedVersion: ${bumppedVersion}`);
                const originMatch = matches[0].toString();
                core.debug(`Bump.bump ${k}.originMatch: ${originMatch}`);
                const bumppedMatch = originMatch.replace(originVersion, bumppedVersion);
                core.debug(`Bump.bump ${k}.bumppedMatch: ${bumppedMatch}`);
                bumppedContent = bumppedContent.replace(originMatch, bumppedMatch);
                core.info(`"${this.file}" bump ${k} to "${bumppedVersion}" from "${originVersion}".`);
                modified = true;
            }
            else {
                core.info(`Can not find ${k} information from "${this.file}".`);
            }
        });
        core.debug(`Bump.bump bumppedContent: ${bumppedContent}`);
        fs.writeFileSync(this.file, bumppedContent, "utf8");
        return modified;
    }
    static bumpVersion(matches, options) {
        if (options === "--major") {
            const versionPart = +matches[2].toString() + 1;
            return `${versionPart}.${matches[3]}.${matches[4]}.${matches[5]}`;
        }
        if (options === "--minor") {
            const versionPart = +matches[3].toString() + 1;
            return `${matches[2]}.${versionPart}.${matches[4]}.${matches[5]}`;
        }
        if (options === "--patch") {
            const versionPart = +matches[4].toString() + 1;
            return `${matches[2]}.${matches[3]}.${versionPart}.${matches[5]}`;
        }
        const versionPart = +matches[5].toString() + 1;
        return `${matches[2]}.${matches[3]}.${matches[4]}.${versionPart}`;
    }
}
exports.Bump = Bump;
