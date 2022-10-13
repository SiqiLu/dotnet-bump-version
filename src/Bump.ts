import * as core from "@actions/core";
import * as fs from "fs";
import { Inputs } from "./Inputs";

export class Bump {
    // Version vs VersionSuffix vs PackageVersion: What do they all mean?
    // https://andrewlock.net/version-vs-versionsuffix-vs-packageversion-what-do-they-all-mean/
    // There's an overwhelming number of versions to choose from, but generally it's best to just set the Version and use it for all of the version numbers.

    private static readonly _versionRex =
        /<Version>[\s]*(([^\.\s]+)[\.]*([^\.\s]*)[\.]*([^\.\s]*)[\.]*([^\.\s]*))[\s]*<\/Version>/i;

    private static readonly _packageVersionRex =
        /<PackageVersion>[\s]*(([^\.\s]+)[\.]*([^\.\s]*)[\.]*([^\.\s]*)[\.]*([^\.\s]*))[\s]*<\/PackageVersion>/i;

    private static readonly _assemblyVersionRex =
        /<AssemblyVersion>[\s]*(([^\.\s]+)[\.]*([^\.\s]*)[\.]*([^\.\s]*)[\.]*([^\.\s]*))[\s]*<\/AssemblyVersion>/i;

    private static readonly _fileVersionRex =
        /<FileVersion>[\s]*(([^\.\s]+)[\.]*([^\.\s]*)[\.]*([^\.\s]*)[\.]*([^\.\s]*))[\s]*<\/FileVersion>/i;

    private static readonly _informationalVersionRex =
        /<InformationalVersion>[\s]*(([^\.\s]+)[\.]*([^\.\s]*)[\.]*([^\.\s]*)[\.]*([^\.\s]*))[\s]*<\/InformationalVersion>/i;

    private static readonly _versions = new Map([
        ["Version", this._versionRex],
        ["PackageVersion", this._packageVersionRex],
        ["AssemblyVersion", this._assemblyVersionRex],
        ["FileVersion", this._fileVersionRex],
        ["InformationalVersion", this._informationalVersionRex]
    ]);

    private static readonly _optionsRex = /(--(major)|--(minor)|--(patch)|--(build))/i;

    private static readonly _numberRex = /^[1-9]+[0-9]*$|^0$/;

    private readonly _file: string;

    private readonly _commitMessage: string;

    private readonly _inputs: Inputs;

    private readonly _bumpOptionFromCommitMessage: string[];

    constructor(file: string, commitMessage: string, inputs: Inputs) {
        this._file = file;
        this._commitMessage = commitMessage;
        this._inputs = inputs;
        this._bumpOptionFromCommitMessage = this._getBumpOptionFromCommitMessage();
    }

    public get bumpMajor(): boolean {
        return (
            !this._inputs.overwriteMajor &&
            (this._bumpOptionFromCommitMessage.includes("major") || this._inputs.bumpMajor)
        );
    }

    public get bumpMinor(): boolean {
        return (
            !this._inputs.overwriteMinor &&
            (this._bumpOptionFromCommitMessage.includes("minor") || this._inputs.bumpMinor)
        );
    }

    public get bumpPatch(): boolean {
        return (
            !this._inputs.overwritePatch &&
            (this._bumpOptionFromCommitMessage.includes("patch") || this._inputs.bumpPatch)
        );
    }

    public get bumpBuild(): boolean {
        return (
            !this._inputs.overwriteBuild &&
            (this._bumpOptionFromCommitMessage.includes("build") || this._inputs.bumpBuild)
        );
    }

    public get overwriteMajor(): boolean {
        return this._inputs.overwriteMajor;
    }

    public get overwriteMinor(): boolean {
        return this._inputs.overwriteMinor;
    }

    public get overwritePatch(): boolean {
        return this._inputs.overwritePatch;
    }

    public get overwriteBuild(): boolean {
        return this._inputs.overwriteBuild;
    }

    public get overwriteMajorString(): string {
        return this._inputs.overwriteMajorString;
    }

    public get overwriteMinorString(): string {
        return this._inputs.overwriteMinorString;
    }

    public get overwritePatchString(): string {
        return this._inputs.overwritePatchString;
    }

    public get overwriteBuildString(): string {
        return this._inputs.overwriteBuildString;
    }

    private static _isNumber(value: string): boolean {
        return this._numberRex.test(value);
    }

    private static _bumpVersionPart(
        part: string,
        needOverwrite: boolean,
        overwriteString: string,
        needBump: boolean,
        previousBumped: boolean
    ): { bumped: boolean; version: string | null } {
        let bumped = false;
        let version = part;

        if (needOverwrite) {
            version = overwriteString;
            core.debug("Bump._bumpVersionPart overwrite version to: " + version);
        } else if (needBump && Bump._isNumber(part)) {
            version = (parseInt(part) + 1).toString();
            bumped = true;
            core.debug("Bump._bumpVersionPart bump version to: " + version);
        } else if (previousBumped && Bump._isNumber(part)) {
            version = "0";
            core.debug("Bump._bumpVersionPart reset version to: " + version);
        }

        return { bumped, version };
    }

    private static _buildModifiedVersion(
        major: string | null,
        minor: string | null,
        patch: string | null,
        build: string | null
    ): string | null {
        let version = "";

        if (major != null) {
            version += major;
        }
        if (minor != null) {
            version += "." + minor;
        }
        if (patch != null) {
            version += "." + patch;
        }
        if (build != null) {
            version += "." + build;
        }

        return version;
    }

    public bump(): boolean {
        core.debug(`Bump.bump file: ${this._file}`);
        const originContent = fs.readFileSync(this._file).toString();
        core.debug("Bump.bump originContent: ");
        core.debug(originContent);

        let bumppedContent = originContent.trim();
        let fileModified = false;

        Bump._versions.forEach((v, k) => {
            const versionMatches = v.exec(bumppedContent);
            core.debug(`Bump.bump versionMatches: ${JSON.stringify(versionMatches)}`);

            if (versionMatches && versionMatches.length == 6) {
                const originVersion = versionMatches[1].toString();
                core.debug(`Bump.bump ${k}.originVersion: ${originVersion}`);

                let hasBumped = false;
                let major: string | null = null;
                let minor: string | null = null;
                let patch: string | null = null;
                let build: string | null = null;

                const majorMatch = versionMatches[2];
                core.debug(`Bump.bump ${k}.majorMatch: ${majorMatch}`);
                if (majorMatch && majorMatch.length > 0) {
                    // version has major part
                    const majorPart = versionMatches[2].toString();
                    core.debug(`Bump.bump version majorPart: ${majorPart}`);
                    core.debug("Bump.bump bump majorPart with arguments:");
                    core.debug(`majorPart: ${majorPart}`);
                    core.debug(`overwriteMajor: ${this.overwriteMajor.toString()}`);
                    core.debug(`overwriteMajorString: ${this.overwriteMajorString}`);
                    core.debug(`bumpMajor: ${this.bumpMajor.toString()}`);
                    core.debug(`hasBumped: ${hasBumped.toString()}`);

                    let bumpResult = Bump._bumpVersionPart(
                        majorPart,
                        this.overwriteMajor,
                        this.overwriteMajorString,
                        this.bumpMajor,
                        hasBumped
                    );
                    hasBumped = bumpResult.bumped;
                    major = bumpResult.version;

                    core.debug(`Bump.bump version modifiedMajorPart: ${major ?? "null"}`);
                }

                const minorMatch = versionMatches[3];
                core.debug(`Bump.bump ${k}.minorMatch: ${minorMatch}`);
                if (minorMatch && minorMatch.length > 0) {
                    // version has minor part
                    const minorPart = versionMatches[3].toString();
                    core.debug(`Bump.bump version minorPart: ${minorPart}`);
                    core.debug("Bump.bump bump minorPart with arguments:");
                    core.debug(`minorPart: ${minorPart}`);
                    core.debug(`overwriteMinor: ${this.overwriteMinor.toString()}`);
                    core.debug(`overwriteMinorString: ${this.overwriteMinorString}`);
                    core.debug(`bumpMinor: ${this.bumpMinor.toString()}`);
                    core.debug(`hasBumped: ${hasBumped.toString()}`);

                    let bumpResult = Bump._bumpVersionPart(
                        minorPart,
                        this.overwriteMinor,
                        this.overwriteMinorString,
                        this.bumpMinor,
                        hasBumped
                    );
                    hasBumped = hasBumped || bumpResult.bumped;
                    minor = bumpResult.version;

                    core.debug(`Bump.bump version modifiedMinorPart: ${minor ?? "null"}`);
                }

                const patchMatch = versionMatches[4];
                core.debug(`Bump.bump ${k}.patchMatch: ${patchMatch}`);
                if (patchMatch && patchMatch.length > 0) {
                    // version has patch part
                    const patchPart = versionMatches[4].toString();
                    core.debug(`Bump.bump version patchPart: ${patchPart}`);
                    core.debug("Bump.bump bump patchPart with arguments:");
                    core.debug(`patchPart: ${patchPart}`);
                    core.debug(`overwritePatch: ${this.overwritePatch.toString()}`);
                    core.debug(`overwritePatchString: ${this.overwritePatchString}`);
                    core.debug(`bumpPatch: ${this.bumpPatch.toString()}`);
                    core.debug(`hasBumped: ${hasBumped.toString()}`);

                    let bumpResult = Bump._bumpVersionPart(
                        patchPart,
                        this.overwritePatch,
                        this.overwritePatchString,
                        this.bumpPatch,
                        hasBumped
                    );
                    hasBumped = hasBumped || bumpResult.bumped;
                    patch = bumpResult.version;

                    core.debug(`Bump.bump version modifiedPatchPart: ${patch ?? "null"}`);
                }

                const buildMatch = versionMatches[5];
                core.debug(`Bump.bump ${k}.buildMatch: ${buildMatch}`);
                if (buildMatch && buildMatch.length > 0) {
                    // version has build part
                    const buildPart = versionMatches[5].toString();
                    core.debug(`Bump.bump version buildPart: ${buildPart}`);
                    core.debug("Bump.bump bump buildPart with arguments:");
                    core.debug(`buildPart: ${buildPart}`);
                    core.debug(`overwriteBuild: ${this.overwriteBuild.toString()}`);
                    core.debug(`overwriteBuildString: ${this.overwriteBuildString}`);
                    core.debug(`bumpBuild: ${this.bumpBuild.toString()}`);
                    core.debug(`hasBumped: ${hasBumped.toString()}`);

                    let bumpResult = Bump._bumpVersionPart(
                        buildPart,
                        this.overwriteBuild,
                        this.overwriteBuildString,
                        this.bumpBuild,
                        hasBumped
                    );
                    hasBumped = hasBumped || bumpResult.bumped;
                    build = bumpResult.version;

                    core.debug(`Bump.bump version modifiedBuildPart: ${build ?? "null"}`);
                }

                const modifiedVersion = Bump._buildModifiedVersion(major, minor, patch, build);
                core.debug(`Bump.bump ${k}.modifiedVersion: ${modifiedVersion ?? "null"}`);

                if (modifiedVersion != null && modifiedVersion !== originVersion) {
                    const originMatch = versionMatches[0].toString();
                    core.debug(`Bump.bump ${k}.originMatch: ${originMatch}`);

                    const modifiedMatch = originMatch.replace(originVersion, modifiedVersion);
                    core.debug(`Bump.bump ${k}.bumppedMatch: ${modifiedMatch}`);

                    bumppedContent = bumppedContent.replace(originMatch, modifiedMatch);

                    core.info(`"${this._file}" bump ${k} to "${modifiedVersion}" from "${originVersion}".`);
                    fileModified = true;
                    core.info(`"${this._file}" has been marked as "modified".`);
                } else {
                    core.info(`"${this._file}" ${k} "${originVersion}" is unbumped.`);
                }
            } else {
                core.info(`Can not find ${k} from "${this._file}" or the format of the version number is incorrect.`);
            }
        });

        core.debug(`Bump.bump fileModified: ${fileModified.toString()}`);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (fileModified) {
            fs.writeFileSync(this._file, bumppedContent, "utf8");
            core.debug("Bump.bump bumppedContent:");
            core.debug(bumppedContent);
            core.info(`Bump.bump ${this._file} overwrited with new versions.`);
        }

        core.info(`Bump.bump for ${this._file} is finishing...`);
        core.info("");
        return fileModified;
    }

    private _getBumpOptionFromCommitMessage(): string[] {
        // ["--major","--major",major,null,null,null]
        // ["--patch","--patch",null,null,"patch",null]

        let options: string[] = [];
        const optionsMatches = Bump._optionsRex.exec(this._commitMessage);
        core.debug(`Bump._getBumpOptionFromCommitMessage optionsMatches: ${JSON.stringify(optionsMatches)}`);

        if (optionsMatches && optionsMatches.length >= 3) {
            options = optionsMatches.filter((v, i) => v && v.length > 0 && i >= 2).map(v => v.toString());
        }

        core.debug(`Bump._getBumpOptionFromCommitMessage options: ${JSON.stringify(options)}`);

        return options;
    }
}
