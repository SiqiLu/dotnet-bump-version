import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import * as globby from "globby";
import { Context } from "@actions/github/lib/context";
import { EOL } from "os";

export class ActionContext {
    private githubContext: Context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private payload: any;

    constructor(githubContext: Context) {
        this.githubContext = githubContext;
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
            if (fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
                this.payload = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }));
            } else {
                const eventPath = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${eventPath} does not exist${EOL}`);
                throw new Error(`GITHUB_EVENT_PATH ${eventPath} does not exist${EOL}`);
            }
        }
    }

    async getVersionFiles(): Promise<string[]> {
        const versionFilesStr = core.getInput("version_files") || "**/*.csproj";

        core.debug(`ActionContext.getVersionFiles versionFilesStr: ${versionFilesStr}`);

        let patterns: string[] = [];

        if (ActionContext.isJsonArray(versionFilesStr) && versionFilesStr) {
            core.debug(
                `ActionContext.getVersionFiles versionFilesStr isJsonArray: ${ActionContext.isJsonArray(
                    versionFilesStr
                )}`
            );

            patterns = JSON.parse(versionFilesStr);
        } else if (typeof versionFilesStr == "string" && versionFilesStr) {
            patterns = [versionFilesStr];
        }

        core.debug(`ActionContext.getVersionFiles versionFilesStr patterns: ${JSON.stringify(patterns)}`);

        const versionFiles = await globby.default(patterns, {
            gitignore: true,
            expandDirectories: true,
            onlyFiles: true,
            ignore: [],
            cwd: process.cwd(),
        });

        core.debug(`ActionContext.getVersionFiles _versionFiles: ${JSON.stringify(versionFiles)}`);

        return versionFiles;
    }

    get eventName(): string {
        return this.githubContext.eventName;
    }

    get sha(): string {
        return this.githubContext.sha;
    }

    get ref(): string {
        return this.githubContext.ref;
    }

    get githubActor(): string {
        return process.env.GITHUB_ACTOR || "";
    }

    get githubRepository(): string {
        return process.env.GITHUB_REPOSITORY || "";
    }

    get githubWorkspace(): string {
        return process.env.GITHUB_REPOSITORY || "";
    }

    get branch(): string {
        return process.env.BRANCH || this.ref.substr("refs/heads/".length) || "";
    }

    get headCommit(): {
        id: string;
        message: string;
        timestamp: string;
        url: string;
        committerName: string;
        committerEmail: string;
        committerUserName: string;
    } {
        return {
            id: this.payload.head_commit.id.toString(),
            message: this.payload.head_commit.message.toString(),
            timestamp: this.payload.head_commit.timestamp.toString(),
            url: this.payload.head_commit.url.toString(),
            committerName: this.payload.head_commit.committer.name.toString(),
            committerEmail: this.payload.head_commit.committer.email.toString(),
            committerUserName: this.payload.head_commit.committer.username.toString(),
        };
    }

    get pusher(): { name: string; email: string } {
        return {
            name: this.payload.pusher.name.toString(),
            email: this.payload.pusher.email.toString(),
        };
    }

    get versionFiles(): string {
        return core.getInput("version_files");
    }

    get githubToken(): string {
        return core.getInput("github_token");
    }

    get needPushChanges(): boolean {
        return this.githubToken ? true : false;
    }

    private static isJson(str: string): boolean {
        if (typeof str == "string") {
            try {
                const obj = JSON.parse(str);
                if (typeof obj == "object" && obj) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                // Is is not a json.
                return false;
            }
        }

        // It is not a string!
        return false;
    }

    private static isJsonArray(str: string): boolean {
        if (typeof str == "string") {
            try {
                const obj = JSON.parse(str);
                if (Array.isArray(obj) && obj) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                // Is is not a json.
                return false;
            }
        }

        // It is not a string!
        return false;
    }

    private static readFiles(dirPath: string): void {
        const fileOrDir = fs.readdirSync(dirPath, "utf8");
        fileOrDir.forEach(e => {
            const fileOrDirPath = path.join(dirPath, e);
            if (fs.statSync(fileOrDirPath).isFile()) {
                core.debug(fileOrDirPath);
            }
            if (fs.statSync(fileOrDirPath).isDirectory()) {
                this.readFiles(fileOrDirPath);
            }
        });
    }
}
