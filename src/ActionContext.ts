import * as core from "@actions/core";
import * as fs from "fs";
import type { Context } from "@actions/github/lib/context";
import { EOL } from "os";

type GithubEvent = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    head_commit: {
        id: string;
        message: string;
        timestamp: string;
        url: string;
        committer: {
            name: string;
            email: string;
            username: string;
        };
    };
    pusher: {
        name: string;
        email: string;
    };
};

export class ActionContext {
    private readonly _githubContext: Context;

    private readonly _payload: GithubEvent | undefined;

    constructor(githubContext: Context) {
        this._githubContext = githubContext;
        if (process.env.GITHUB_EVENT_PATH != null) {
            if (fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
                let githubEvent = JSON.parse(
                    fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" })
                ) as unknown;

                core.debug("///    githubEvent:");
                core.debug("///    " + JSON.stringify(githubEvent));
                core.debug("");

                this._payload = githubEvent as GithubEvent;
            } else {
                const eventPath = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${eventPath} does not exist${EOL}`);
                throw new Error(`GITHUB_EVENT_PATH ${eventPath} does not exist${EOL}`);
            }
        }
    }

    public get eventName(): string {
        return this._githubContext.eventName;
    }

    public get sha(): string {
        return this._githubContext.sha;
    }

    public get ref(): string {
        return this._githubContext.ref;
    }

    public get githubActor(): string {
        return process.env.GITHUB_ACTOR ?? "";
    }

    public get githubRepository(): string {
        return process.env.GITHUB_REPOSITORY ?? "";
    }

    public get githubWorkspace(): string {
        return process.env.GITHUB_REPOSITORY ?? "";
    }

    public get branch(): string {
        return process.env.BRANCH ?? this.ref.substring(0, "refs/heads/".length);
    }

    public get headCommit(): {
        id: string;
        message: string;
        timestamp: string;
        url: string;
        committerName: string;
        committerEmail: string;
        committerUserName: string;
    } {
        return {
            id: this._payload?.head_commit.id.toString() ?? "",
            message: this._payload?.head_commit.message.toString() ?? "",
            timestamp: this._payload?.head_commit.timestamp.toString() ?? "",
            url: this._payload?.head_commit.url.toString() ?? "",
            committerName: this._payload?.head_commit.committer.name.toString() ?? "",
            committerEmail: this._payload?.head_commit.committer.email.toString() ?? "",
            committerUserName: this._payload?.head_commit.committer.username.toString() ?? ""
        };
    }

    public get pusher(): { name: string; email: string } {
        return {
            name: this._payload?.pusher.name.toString() ?? "",
            email: this._payload?.pusher.email.toString() ?? ""
        };
    }

    // private static _readFiles(dirPath: string): void {
    //     const fileOrDir = fs.readdirSync(dirPath, "utf8");
    //     fileOrDir.forEach(e => {
    //         const fileOrDirPath = path.join(dirPath, e);
    //         if (fs.statSync(fileOrDirPath).isFile()) {
    //             core.debug(fileOrDirPath);
    //         }
    //         if (fs.statSync(fileOrDirPath).isDirectory()) {
    //             this._readFiles(fileOrDirPath);
    //         }
    //     });
    // }
}
