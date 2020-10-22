import * as core from "@actions/core";
import * as github from "@actions/github";
import { ActionContext } from "./ActionContext";
import { Bump } from "./Bump";
import { commit } from "./Commit";

async function bumpVersion(): Promise<void> {
    core.info("dotnet-bump-version 2028");
    core.info("dotnet-bump-version action is running...");
    core.info("");

    const actionContext = new ActionContext(github.context);

    core.debug("githubContext:");
    core.debug(JSON.stringify(github.context));

    core.debug("actionContext:");
    core.debug(
        JSON.stringify({
            eventName: actionContext.eventName,
            sha: actionContext.sha,
            ref: actionContext.ref,
            branch: actionContext.branch,
            headCommit: actionContext.headCommit,
            pusher: actionContext.pusher,
        })
    );

    core.debug("inputs:");
    core.debug(
        JSON.stringify({
            versionFiles: actionContext.versionFiles,
            githubToken: actionContext.githubToken,
            pushChanges: actionContext.needPushChanges,
        })
    );

    // 只在 Github event 为 push 的时候生效
    if (github.context.eventName !== "push") {
        core.info('Github event is not "push", exit.');
        return;
    }

    core.info(`eventName: ${actionContext.eventName}`);
    core.info(`sha: ${actionContext.sha}`);
    core.info(`ref: ${actionContext.ref}`);
    core.info(`githubActor: ${actionContext.githubActor}`);
    core.info(`githubRepository: ${actionContext.githubRepository}`);
    core.info(`githubWorkspace: ${actionContext.githubWorkspace}`);
    core.info(`branch: ${actionContext.branch}`);
    core.info(`pusher: ${actionContext.pusher.name}`);
    core.info(`headCommit.id: ${actionContext.headCommit.id}`);
    core.info(`headCommit.message: ${actionContext.headCommit.message}`);
    core.info(`headCommit.timestamp: ${actionContext.headCommit.timestamp}`);
    core.info("");

    // 替换 version file 中的 version
    const versionFiles = await actionContext.getVersionFiles();

    core.info(`VersionFiles: ${JSON.stringify(versionFiles)}`);

    var bumpedFiles = versionFiles.filter(file => {
        const bump = new Bump(file, actionContext.headCommit.message);
        return bump.bump();
    });

    // 推动更改
    if (actionContext.needPushChanges && actionContext.githubToken) {
        await commit(actionContext, bumpedFiles, "Bump versions by dotnet-bump-version.", actionContext.githubToken);
    }
}

async function run(): Promise<void> {
    try {
        await bumpVersion();
    } catch (error) {
        core.setFailed(error.message);
    }
}

run().catch(err => core.setFailed(err.message));
