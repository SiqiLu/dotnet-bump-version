import * as core from "@actions/core";
import * as github from "@actions/github";
import { ActionContext } from "./ActionContext";
import { Bump } from "./Bump";
import { commit } from "./Commit";
import { Inputs } from "./Inputs";

async function bumpVersion(): Promise<void> {
    core.info("dotnet-bump-version action is running...");
    core.info("");

    const inputs = Inputs.current;
    core.info("///    inputs:");
    core.info("///    " + JSON.stringify(inputs));
    core.info("");

    const githubContext = github.context;
    core.info("///    githubContext:");
    core.info("///    " + JSON.stringify(githubContext));
    core.info("");

    const actionContext = new ActionContext(githubContext);
    core.info("///    actionContext:");
    core.info("///    " + JSON.stringify({ actionContext }));
    core.info("");

    // 只在 Github event 为 push 的时候生效
    if (github.context.eventName !== "push") {
        core.info(`Github event is ${github.context.eventName} and not "push", exit.`);
        return;
    }

    // 替换 version file 中的 version
    const versionFiles = inputs.getVersionFiles();
    core.info("///    versionFiles:");
    core.info("///    " + JSON.stringify(versionFiles));
    core.info("");

    // Issue #5
    // Only commit changed files
    let bumpedFiles = versionFiles.filter(file => {
        const bump = new Bump(file, actionContext.headCommit.message, inputs);
        return bump.bump();
    });

    // push changes
    if (inputs.needPushChanges && inputs.githubToken) {
        await commit(bumpedFiles, actionContext, "Bump versions by dotnet-bump-version.", inputs.githubToken);
    }

    core.info("dotnet-bump-version action is finishing...");
}

async function run(): Promise<void> {
    try {
        await bumpVersion();
    } catch (error: unknown) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run().catch(error => {
    if (error instanceof Error) {
        core.setFailed(error.message);
    }
});
