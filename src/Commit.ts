import * as core from "@actions/core";
import { exec, ExecOptions } from "@actions/exec";
import { ActionContext } from "./ActionContext";

export const commit = async (
    filesToCommit: string[],
    eventContext: ActionContext,
    message: string,
    githubToken: string
): Promise<void> => {
    try {
        core.info(`Committing changes with message "${message}".`);
        const remoteRepository = `https://${eventContext.githubActor}:${githubToken}@github.com/${eventContext.githubRepository}.git`;

        const options = {
            cwd: process.cwd(),
            listeners: {
                stdline: core.debug,
                stderr: core.debug,
                debug: core.debug
            }
        } as unknown as ExecOptions;

        core.info("git status");
        await exec("git", ["status"], options);

        core.info(`git config user.name "${eventContext.pusher.name}"`);
        await exec("git", ["config", "user.name", `"${eventContext.pusher.name}"`], options);

        core.info(`git config user.email "${eventContext.pusher.email}"`);
        await exec("git", ["config", "user.email", `"${eventContext.pusher.email}"`], options);

        // Issue #10
        // While Git was updated from 2.33.0 to 2.33.1, need to specify how to reconcile divergent branches.
        core.info(`git config pull.rebase false`);
        await exec("git", ["config", "pull.rebase", `false`], options);

        core.info(`git remote add publisher ${remoteRepository}`);
        await exec("git", ["remote", "add", "publisher", remoteRepository], options);
        // await exec('git', ['show-ref'], options)
        // await exec('git', ['branch', '--verbose'], options)

        // await exec("git", ["add", "-A"], options);

        // Issue #5
        // Only commit changed files
        for (const file of filesToCommit) {
            core.info(`git add "${file}"`);
            await exec("git", ["add", file], options);
        }

        core.info("git status");
        await exec("git", ["status"], options);

        try {
            core.info(`git commit -m ${message}`);
            await exec("git", ["commit", "-m", `${message}`], options);
        } catch (error: unknown) {
            if (error instanceof Error) {
                core.warning(`Warning: git commit failed. The error message is ${error.message}`);
                core.warning(`Warning: git push will be skipped.`);
            }
            return;
        }

        core.info("git branch bump_tmp_");
        await exec("git", ["branch", "bump_tmp_"], options);

        core.info(`git checkout ${eventContext.branch}`);
        await exec("git", ["checkout", eventContext.branch], options);

        core.info("git merge bump_tmp_");
        await exec("git", ["merge", "bump_tmp_"], options);

        core.info(`git pull --no-edit --commit --strategy-option theirs publisher ${eventContext.branch}`);
        await exec(
            "git",
            ["pull", "--no-edit", "--commit", "--strategy-option", "theirs", "publisher", eventContext.branch],
            options
        );

        core.info(`git push publisher ${eventContext.branch}`);
        await exec("git", ["push", "publisher", eventContext.branch], options);
    } catch (error: unknown) {
        if (error instanceof Error) {
            core.error(error.message);
            core.setFailed(error.message);
        }

        process.exit(1);
    }
};
