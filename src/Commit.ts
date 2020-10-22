import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { ActionContext } from "./ActionContext";

export const commit = async (
    versionFiles: string[],
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
                debug: core.debug,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        core.info("git status");
        await exec("git", ["status"], options);

        core.info(`git config user.name "${eventContext.pusher.name}"`);
        await exec("git", ["config", "user.name", `"${eventContext.pusher.name}"`], options);
        
        core.info(`git config user.email "${eventContext.pusher.email}"`);
        await exec("git", ["config", "user.email", `"${eventContext.pusher.email}"`], options);
        
        core.info(`git remote add publisher ${remoteRepository}`);
        await exec("git", ["remote", "add", "publisher", remoteRepository], options);
        // await exec('git', ['show-ref'], options)
        // await exec('git', ['branch', '--verbose'], options)

        // await exec("git", ["add", "-A"], options);

        for (const file of versionFiles) {
            core.info(`git add "${file}"`);
            await exec("git", ["add", file], options);
        }

        core.info("git status");
        await exec("git", ["status"], options);

        try {
            core.info(`git commit -m ${message}`);
            await exec("git", ["commit", "-m", `${message}`], options);
        } catch (err) {
            core.warning("nothing to commit");
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
    } catch (err) {
        core.error(err.message);
        core.setFailed(err.message);
        process.exit(1);
    }
};
