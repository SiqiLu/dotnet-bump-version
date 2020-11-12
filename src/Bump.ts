import * as core from "@actions/core";
import * as fs from "fs";

export class Bump {
    readonly versionRex = /<Version>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/Version>/i;
    readonly packageVersionRex = /<PackageVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/PackageVersion>/i;
    readonly assemblyVersionRex = /<AssemblyVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/AssemblyVersion>/i;
    readonly fileVersionRex = /<FileVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/FileVersion>/i;
    readonly informationalVersionRex = /<InformationalVersion>[\S]*(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))[\S]*<\/InformationalVersion>/gi;

    readonly versions = new Map([
        ["Version", this.versionRex],
        ["PackageVersion", this.packageVersionRex],
        ["AssemblyVersion", this.assemblyVersionRex],
        ["FileVersion", this.fileVersionRex],
        ["InformationalVersion", this.informationalVersionRex],
    ]);

    readonly optionsRex = /(--(major)|--(minor)|--(patch))/i;

    file: string;
    message: string;
    versionNumber: string | null;

    constructor(file: string, message: string, versionNumber: string | null) {
        this.file = file;
        this.message = message;
        this.versionNumber = versionNumber;
    }

    bump(): boolean {
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
                const bumppedVersion = Bump.bumpVersion(matches, options, this.versionNumber);
                core.debug(`Bump.bump ${k}.bumppedVersion: ${bumppedVersion}`);
                const originMatch = matches[0].toString();
                core.debug(`Bump.bump ${k}.originMatch: ${originMatch}`);
                const bumppedMatch = originMatch.replace(originVersion, bumppedVersion);
                core.debug(`Bump.bump ${k}.bumppedMatch: ${bumppedMatch}`);
                bumppedContent = bumppedContent.replace(originMatch, bumppedMatch);

                core.info(`"${this.file}" bump ${k} to "${bumppedVersion}" from "${originVersion}".`);
                modified = true;
            } else {
                core.info(`Can not find ${k} information from "${this.file}".`);
            }
        });

        core.debug(`Bump.bump bumppedContent: ${bumppedContent}`);
        fs.writeFileSync(this.file, bumppedContent, "utf8");
        
      return modified;
    }

    private static bumpVersion(matches: RegExpMatchArray, options: string, number: string | null): string {
        if (options === "--major") {
            const versionPart = number || +matches[2].toString() + 1;
            return `${versionPart}.${matches[3]}.${matches[4]}.${matches[5]}`;
        }

        if (options === "--minor") {
            const versionPart = number || +matches[3].toString() + 1;
            return `${matches[2]}.${versionPart}.${matches[4]}.${matches[5]}`;
        }

        if (options === "--patch") {
            const versionPart = number || +matches[4].toString() + 1;
            return `${matches[2]}.${matches[3]}.${versionPart}.${matches[5]}`;
        }

        const versionPart = number || +matches[5].toString() + 1;
        return `${matches[2]}.${matches[3]}.${matches[4]}.${versionPart}`;
    }
}
