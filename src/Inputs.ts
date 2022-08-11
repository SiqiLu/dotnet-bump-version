import * as core from "@actions/core";

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

    private readonly _overwriteBuildRex: RegExp = /^[^\.\s]*\.[^\.\s]*\.[^\.\s]*\.([^\.\s]*)$/;

    private _overwriteMajor: boolean | null = null;

    private _overwriteMinor: boolean | null = null;

    private _overwritePatch: boolean | null = null;

    private _overwriteBuild: boolean | null = null;

    private _overwriteMajorString: string | null = null;

    private _overwriteMinorString: string | null = null;

    private _overwritePatchString: string | null = null;

    private _overwriteBuildString: string | null = null;

    private _versionFiles: string[] = [];

    private constructor() {
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

    public get versionFilesPatterns(): string[] {
        let patterns: string[] = [];

        if (Inputs._isJsonArray(this.versionFiles)) {
            patterns = JSON.parse(this.versionFiles) as string[];
        } else if (typeof this.versionFiles == "string" && this.versionFiles) {
            patterns = [this.versionFiles];
        }
        return patterns;
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
        if (this._overwriteMajor != null) {
            return this._overwriteMajor;
        }
        const matches = this._overwriteMajorRex.exec(this.versionOverwrite);

        core.debug("Inputs.overwriteMajor RexMatches: " + JSON.stringify(matches ?? "null"));

        if (matches && matches.length >= 2) {
            return (this._overwriteMajor = matches[1].toString() != "*");
        }
        return (this._overwriteMajor = false);
    }

    public get overwriteMinor(): boolean {
        if (this._overwriteMinor != null) {
            return this._overwriteMinor;
        }
        const matches = this._overwriteMinorRex.exec(this.versionOverwrite);

        core.debug("Inputs.overwriteMinor RexMatches: " + JSON.stringify(matches ?? "null"));

        if (matches && matches.length >= 2) {
            return (this._overwriteMinor = matches[1].toString() != "*");
        }
        return (this._overwriteMinor = false);
    }

    public get overwritePatch(): boolean {
        if (this._overwritePatch != null) {
            return this._overwritePatch;
        }
        const matches = this._overwritePatchRex.exec(this.versionOverwrite);

        core.debug("Inputs.overwritePatch RexMatches: " + JSON.stringify(matches ?? "null"));

        if (matches && matches.length >= 2) {
            return (this._overwritePatch = matches[1].toString() != "*");
        }
        return (this._overwritePatch = false);
    }

    public get overwriteBuild(): boolean {
        if (this._overwriteBuild != null) {
            return this._overwriteBuild;
        }
        const matches = this._overwriteBuildRex.exec(this.versionOverwrite);

        core.debug("Inputs.overwriteBuild RexMatches: " + JSON.stringify(matches ?? "null"));

        if (matches && matches.length >= 2) {
            return (this._overwriteBuild = matches[1].toString() != "*");
        }
        return (this._overwriteBuild = false);
    }

    public get overwriteMajorString(): string {
        if (this._overwriteMajorString != null) {
            return this._overwriteMajorString;
        }
        const matches = this._overwriteMajorRex.exec(this.versionOverwrite);

        core.debug("Inputs.overwriteMajorString RexMatches: " + JSON.stringify(matches ?? "null"));

        if (matches && matches.length >= 2) {
            return (this._overwriteMajorString = matches[1].toString());
        }
        return (this._overwriteMajorString = "");
    }

    public get overwriteMinorString(): string {
        if (this._overwriteMinorString != null) {
            return this._overwriteMinorString;
        }
        const matches = this._overwriteMinorRex.exec(this.versionOverwrite);

        core.debug("Inputs.overwriteMinorString RexMatches: " + JSON.stringify(matches ?? "null"));

        if (matches && matches.length >= 2) {
            return (this._overwriteMinorString = matches[1].toString());
        }
        return (this._overwriteMinorString = "");
    }

    public get overwritePatchString(): string {
        if (this._overwritePatchString != null) {
            return this._overwritePatchString;
        }
        const matches = this._overwritePatchRex.exec(this.versionOverwrite);

        core.debug("Inputs.overwritePatchString RexMatches: " + JSON.stringify(matches ?? "null"));

        if (matches && matches.length >= 2) {
            return (this._overwritePatchString = matches[1].toString());
        }
        return (this._overwritePatchString = "");
    }

    public get overwriteBuildString(): string {
        if (this._overwriteBuildString != null) {
            return this._overwriteBuildString;
        }
        const matches = this._overwriteBuildRex.exec(this.versionOverwrite);

        core.debug("Inputs.overwriteBuildString RexMatches: " + JSON.stringify(matches ?? "null"));

        if (matches && matches.length >= 2) {
            return (this._overwriteBuildString = matches[1].toString());
        }
        return (this._overwriteBuildString = "");
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

    public async getVersionFiles(): Promise<string[]> {
        if (this._versionFiles.length > 0) {
            return this._versionFiles;
        }

        const globby = await import("globby");

        this._versionFiles = await globby.globby(this.versionFilesPatterns, {
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
