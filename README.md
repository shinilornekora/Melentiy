# Melentiy - yet another tool for frontenders
- `GPT-automated` project stack definition
- Automated project structure creation
- Integrated dependency control

## How do I use it and what does it do?

1. User inputs the project idea into the input field.
2. `GPT` resolves the basic settings for this project (project name, most relevant architecture, dependencies).
3. The `app` creates the project structure using previously gathered data.
4. The `app` generates all basic files and readme files for all parts of the project.
5. The `app` creates enough of an environment to make the project runnable after being generated in one click.
6. The `Automated Dependency System (ADS)` is enabled:
    - Every build, clean install, or npm command triggers a common check of the `ADS`.
    - Existing dependencies can only be deleted by the maintainer.
    - New dependencies can only be added by the maintainer.
    - All install-changing operations are blocked.
    - All `GPT-resolved` dependencies become read-only.
    - All newly added dependencies become read-only.

The ADS includes the following options:
- All existing packages are checked for CVE issues.
    - If there's a high or critical `CVE` in a package, the system attempts to downgrade it to a secure version.
    - If a `CVE` is fixed in the latest version, the system upgrades the package to that version.
- The system scans for unused packages, uninstalling those that haven't been used in the last 5 hours.
- If the system detects a local dependency pointer, it will be deleted immediately.
- All current versions are locked.

## How can I control ADS package actions?

Basically, you should avoid doing this — the main purpose of this app is to prevent front-end developers from digging into dependencies in search of `CVEs` or other mismatches.

However, if you are developing a local package, you may use the .melignore file.

There are a few rules about it:
- Each project name should be listed on a separate line.
- You must be the maintainer of the package.
- If you are not the maintainer, the rules will be simplified—you will have the option to install one of the three most recent versions.