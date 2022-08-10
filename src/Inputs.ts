import * as core from "@actions/core";
import * as globby from "globby";

export class Inputs {
    private static readonly _instance: Inputs = new Inputs();

    private readonly _defaultVersionFiles: string = "**/*.csproj";

    private readonly _defaultVersionMask: string = "0.0.1.0";

    private readonly _defaultVersionOverwrite: string = "*.*.*.*";

    private readonly _bumpMajorRex: RegExp = /^1\.[0-1]\.[0-1]\.[0-1]$/;

    private readonly _bumpMinorRex: RegExp = /^[0-1]\.1\.[0-1]\.[0-1]$/;

    private readonly _bumpPatchRex: RegExp = /^[0-1]\.[0-1]\.1\.[0-1]$/;

    private readonly _bumpBuildRex: RegExp = /^[0-1]\.[0-1]\.[0-1]\.1$/;

    private readonly _overwriteMajorRex: RegExp = /^([^\.\s]*)\.[^\.\s]*\.[^\.\s]*\.[^\.\s]*$/;

    private readonly _overwriteMinorRex: RegExp = /^[^\.\s]*\.([^\.\s]*)\.[^\.\s]*\.[^\.\s]*$/;

    private readonly _overwritePatchRex: RegExp = /^[^\.\s]*\.[^\.\s]*\.([^\.\s]*)\.[^\.\s]*$/;

    private readonly _overwriteBuildRex: RegExp = /^[^\.\s]*\.[^\.\s]*\.[^\.\s]*\.([^\.\s])*$/;

    private _versionFiles: string[];

    private constructor() {
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

    public static get current(): Inputs {
        return Inputs._instance;
    }

    public get versionFiles(): string {
        return core.getInput("version_files") || this._defaultVersionFiles;
    }

    public get versionMask(): string {
        return core.getInput("version_mask") || this._defaultVersionMask;
    }

    public get versionOverwrite(): string {
        return core.getInput("version_overwrite") || this._defaultVersionOverwrite;
    }

    public get githubToken(): string {
        return core.getInput("github_token") || "";
    }

    public get bumpMajor(): boolean {
        return this._bumpMajorRex.test(this.versionMask);
    }

    public get bumpMinor(): boolean {
        return this._bumpMinorRex.test(this.versionMask);
    }

    public get bumpPatch(): boolean {
        return this._bumpPatchRex.test(this.versionMask);
    }

    public get bumpBuild(): boolean {
        return this._bumpBuildRex.test(this.versionMask);
    }

    public get needOverwriteVersion(): boolean {
        return this.overwriteMajor || this.overwriteMinor || this.overwritePatch || this.overwriteBuild;
    }

    public get overwriteMajor(): boolean {
        const matches = this._overwriteMajorRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString() != "*";
        }
        return false;
    }

    public get overwriteMinor(): boolean {
        const matches = this._overwriteMinorRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString() != "*";
        }
        return false;
    }

    public get overwritePatch(): boolean {
        const matches = this._overwritePatchRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString() != "*";
        }
        return false;
    }

    public get overwriteBuild(): boolean {
        const matches = this._overwriteBuildRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString() != "*";
        }
        return false;
    }

    public get overwriteMajorString(): string {
        const matches = this._overwriteMajorRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString();
        }
        return "";
    }

    public get overwriteMinorString(): string {
        const matches = this._overwriteMinorRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString();
        }
        return "";
    }

    public get overwritePatchString(): string {
        const matches = this._overwritePatchRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString();
        }
        return "";
    }

    public get overwriteBuildString(): string {
        const matches = this._overwriteBuildRex.exec(this.versionOverwrite);
        if (matches && matches.length >= 1) {
            return matches[0].toString();
        }
        return "";
    }

    public get needPushChanges(): boolean {
        return this.githubToken.length > 0 ? true : false;
    }

    private static _isJson(str: string): boolean {
        if (typeof str == "string") {
            try {
                const obj = JSON.parse(str) as unknown;
                if (obj != null && typeof obj == "object") {
                    return true;
                } else {
                    return false;
                }
            } catch (error: unknown) {
                // Is is not a json.
                return false;
            }
        }

        // It is not a string!
        return false;
    }

    private static _isJsonArray(str: string): boolean {
        if (typeof str == "string") {
            try {
                const obj = JSON.parse(str) as unknown;
                if (obj != null && Array.isArray(obj)) {
                    return true;
                } else {
                    return false;
                }
            } catch (error: unknown) {
                // Is is not a json array.
                return false;
            }
        }

        // It is not a string!
        return false;
    }

    public getVersionFiles(): string[] {
        if (this._versionFiles.length > 0) {
            return this._versionFiles;
        }

        const versionFilesPatterns = this.versionFiles;

        core.debug(`Inputs.versionFilesPatternsString: ${versionFilesPatterns}`);

        let patterns: string[] = [];

        if (Inputs._isJsonArray(versionFilesPatterns)) {
            core.debug("Inputs.getVersionFiles versionFilesPatterns isJsonArray: true");
            patterns = JSON.parse(versionFilesPatterns) as string[];
        } else if (typeof versionFilesPatterns == "string" && versionFilesPatterns) {
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
