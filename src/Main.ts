import * as core from "@actions/core";
import * as github from "@actions/github";
import { ActionContext } from "./ActionContext";
import { Bump } from "./Bump";
import { commit } from "./Commit";

async function bumpVersion(): Promise<void> {
    core.info("dotnet-bump-version action is running...");
    core.info("");

    const actionContext = new ActionContext(github.context);

    core.debug("Main.bumpVersion githubContext:");
    core.debug("Main.bumpVersion " + JSON.stringify(github.context));

    core.debug("Main.bumpVersion actionContext:");
    core.debug(
        "Main.bumpVersion " +
            JSON.stringify({
                eventName: actionContext.eventName,
                sha: actionContext.sha,
                ref: actionContext.ref,
                branch: actionContext.branch,
                headCommit: actionContext.headCommit,
                pusher: actionContext.pusher,
            })
    );

    core.debug("Main.bumpVersion inputs:");
    core.debug(
        "Main.bumpVersion " +
            JSON.stringify({
                versionFiles: actionContext.versionFiles,
                githubToken: actionContext.githubToken,
                pushChanges: actionContext.needPushChanges,
            })
    );

    // 只在 Github event 为 push 的时候生效
    if (github.context.eventName !== "push") {
        core.info(`Github event is ${github.context.eventName} and not "push", exit.`);
        return;
    }

    core.debug(`Main.bumpVersion eventName: ${actionContext.eventName}`);
    core.debug(`Main.bumpVersion sha: ${actionContext.sha}`);
    core.debug(`Main.bumpVersion ref: ${actionContext.ref}`);
    core.debug(`Main.bumpVersion githubActor: ${actionContext.githubActor}`);
    core.debug(`Main.bumpVersion githubRepository: ${actionContext.githubRepository}`);
    core.debug(`Main.bumpVersion githubWorkspace: ${actionContext.githubWorkspace}`);
    core.debug(`Main.bumpVersion branch: ${actionContext.branch}`);
    core.debug(`Main.bumpVersion pusher: ${actionContext.pusher.name}`);
    core.debug(`Main.bumpVersion headCommit.id: ${actionContext.headCommit.id}`);
    core.debug(`Main.bumpVersion headCommit.message: ${actionContext.headCommit.message}`);
    core.debug(`Main.bumpVersion headCommit.timestamp: ${actionContext.headCommit.timestamp}`);

    // 替换 version file 中的 version
    const versionFiles = await actionContext.getVersionFiles();

    core.info(`VersionFiles: ${JSON.stringify(versionFiles)}`);
    
    // Issue #5
    // Only commit changed files 
    var bumpedFiles = versionFiles.filter(file => {
        const bump = new Bump(file, actionContext.headCommit.message, actionContext.versionNumber);
        return bump.bump();
    });

    // 推动更改
    if (actionContext.needPushChanges && actionContext.githubToken) {
        await commit(bumpedFiles, actionContext, "Bump versions by dotnet-bump-version.", actionContext.githubToken);
    }

    core.debug("Finishing: dotnet-bump-version");
}

async function run(): Promise<void> {
    try {
        await bumpVersion();
    } catch (error) {
        core.setFailed(error.message);
    }
}

run().catch(err => core.setFailed(err.message));
