"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
class Bump {
    constructor(file, message) {
        this.versionRex = /<Version>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/Version>/i;
        this.packageVersionRex = /<PackageVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/PackageVersion>/i;
        this.assemblyVersionRex = /<AssemblyVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/AssemblyVersion>/i;
        this.fileVersionRex = /<FileVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/FileVersion>/i;
        this.informationalVersionRex = /<InformationVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/InformationVersion>/gi;
        this.optionsRex = /(--(major)|--(minor)|--(patch))/i;
        this.file = file;
        this.message = message;
    }
    bump() {
        const originContent = fs.readFileSync(this.file, "utf8").toString();
        core.debug(`Bump.bump originContent: ${originContent}`);
        const matches = this.versionRex.exec(originContent);
        core.debug(`Bump.bump matches: ${JSON.stringify(matches)}`);
        const optionsMatches = this.optionsRex.exec(this.message);
        core.debug(`Bump.bump optionsMatches: ${JSON.stringify(optionsMatches)}`);
        let options = "build";
        if (optionsMatches && optionsMatches.length === 3) {
            options = optionsMatches[1].toString();
        }
        core.debug(`Bump.bump options: ${JSON.stringify(options)}`);
        if (matches && matches.length === 6) {
            const originVersion = matches[1].toString();
            core.debug(`Bump.bump originVersion: ${originVersion}`);
            const bumppedVersion = Bump.bumpVersion(matches, options);
            core.debug(`Bump.bump bumppedVersion: ${bumppedVersion}`);
            const bumppedContent = originContent.replace(/originVersion/gi, bumppedVersion);
            core.debug(`Bump.bump bumppedContent: ${bumppedContent}`);
            fs.writeFileSync(this.file, bumppedContent, "utf8");
            core.info(`${this.file} bump version to ${bumppedVersion} from ${originVersion} .`);
        }
        else {
            core.warning(`Can not find version information from ${this.file} .`);
        }
    }
    static bumpVersion(matches, options) {
        if (options === "major") {
            const versionPart = +matches[2].toString() + 1;
            return `${versionPart}.${matches[3]}.${matches[4]}.${matches[5]}`;
        }
        if (options === "minor") {
            const versionPart = +matches[3].toString() + 1;
            return `${matches[2]}.${versionPart}.${matches[4]}.${matches[5]}`;
        }
        if (options === "patch") {
            const versionPart = +matches[4].toString() + 1;
            return `${matches[2]}.${matches[3]}.${versionPart}.${matches[5]}`;
        }
        const versionPart = +matches[5].toString() + 1;
        return `${matches[2]}.${matches[3]}.${matches[4]}.${versionPart}`;
    }
}
exports.Bump = Bump;
