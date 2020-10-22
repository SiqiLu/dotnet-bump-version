import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { ActionContext } from "./ActionContext";

export const commit = async (eventContext: ActionContext, filesToCommit: string[], message: string, githubToken: string): Promise<void> => {
    try {
        core.info(`Committing changes with message "${message}".`);
        const remoteRepository = `https://${eventContext.githubActor}:${githubToken}@github.com/${eventContext.githubRepository}.git`;

        const options = {
            cwd: process.cwd(),
            listeners: {
                stdline: core.debug,
                stderr: core.debug,
                debug: core.debug,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        await exec("git", ["config", "user.name", `"${eventContext.pusher.name}"`], options);
        await exec("git", ["config", "user.email", `"${eventContext.pusher.email}"`], options);

        await exec("git", ["remote", "add", "publisher", remoteRepository], options);
        // await exec('git', ['show-ref'], options)
        // await exec('git', ['branch', '--verbose'], options)

        for (const file of filesToCommit) {
            await exec("git", ["add", file], options);
        }

        try {
            await exec("git", ["commit", "-m", `${message}`], options);
            await exec("git", ["log", "-5", "--pretty=oneline"], options);
        } catch (err) {
            core.debug("nothing to commit");
            return;
        }
        await exec("git", ["branch", "bump_tmp_"], options);
        await exec("git", ["checkout", eventContext.branch], options);
        await exec("git", ["merge", "bump_tmp_"], options);
        await exec(
            "git",
            ["pull", "--no-edit", "--commit", "--strategy-option", "theirs", "publisher", eventContext.branch],
            options
        );
        await exec("git", ["push", "publisher", eventContext.branch], options);
    } catch (err) {
        core.error(err.message);
        core.setFailed(err.message);
        process.exit(1);
    }
};
