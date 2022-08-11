# dotnet-bump-version

A GitHub Action to easily bump .NET Core project version files(.csproj).

-   Bumps the version number in the provided version files(default **/*.csproj).
-   Push changes to the repository that triggered a workflow.

This action program only supports "push" events.

## Usage

<!-- start usage -->

```yaml
- uses: SiqiLu/dotnet-bump-version@master
  with:
      # Version files to bump version. 
      # You can use Glob pattern string (like "**/*.csproj") or Glob patterns array json string (like "["**/*.csproj", "v1.version", "**/*.version.json", "!v2.version.json"]"). # # Patterns supported by Globby are supported. Leading ! changes the meaning of an include pattern to exclude.
      # default: "**/*.csproj"
      # required: false
      version_file: "**/*.csproj"
      
      # Control which part of the version to be bumped. 
      # Example:
      #   "1.0.0.0": Bump the major part of the version.  2.3.4.5 => 3.0.0.0
      #   "0.1.0.0": Bump the minor part of the version.  2.3.4.5 => 2.4.0.0
      #   "0.0.1.0": Bump the patch part of the version.  2.3.4.5 => 2.3.5.0
      #   "0.0.0.1": Bump the minor part of the version.  2.3.4.5 => 2.3.4.6
      #   "1.0.1.0": Bump the major and the patch part of the version.  2.3.4.5 => 3.0.5.0
      #   "1.1.1.1": Bump all the parts of the version.  2.3.4.5 => 3.4.5.6 
      # default: "0.0.1.0"
      # required: false
      version_mask: "0.0.1.0"

      # Overwrite the bumped version. Use this input option to overwrite the version or part of the version. 
      # If you want to modified all versions in the version files to a specifed version number, you should use this input option. 
      # If you do not want overwrite the version or any part of the version, you should just ignore this input option. 
      # Example:
      #   "*.*.*.*" does not overwrite ant part of the version.
      #   "1.*.*.*" overwrite the major part with number 1.
      #   "*.*.*.Alpha" overwrite the build part with string "Alpha".
      #   "*.*.*.${{ github.run_number }}" overwrite the build part with ${{ github.run_number }}.'
      # default: "*.*.*.*"
      # required: false
      version_overwrite: "*.*.*.*"

      # The github token to push changes.
      # required: false
      github_token: ${{ secrets.GITHUB_TOKEN }}
```

<!-- end usage -->

## Example usage

```yaml
name: .NET Build

on: 
    # Triggers the workflow on push events but only for the "master" branch
    push:
        branches: [ "master" ]

    # Allows you to run this workflow manually from the Actions tab
    workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
    build:
        runs-on: windows-latest

        steps:
            - uses: actions/checkout@v3
            - name: Setup .NET Core
              uses: actions/setup-dotnet@v2
              with:
                  dotnet-version: 6.0.x
            - name: Install dependencies
              run: dotnet restore
            - name: Build
              run: dotnet build --configuration Release --no-restore
            - name: Bump versions
              uses: SiqiLu/dotnet-bump-version@2.1.0
              with:
                  version_files: "**/*.csproj"
                  version_mask: 0.0.1.0
                  version_overwrite: "*.*.*.*"
                  github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Test cases

- [ ]   1.0.0.0 => 1.0.0.1
- [ ]   2.3.4.5 => 2.3.5.0
- [ ]   2.3.4.5 => 3.0.0.0
- [ ]   2.3.4.5 => 3.0.5.0
- [ ]   2.3.4 => 2.4.0
- [ ]   2.3.4 => 3.0.0
- [ ]   2.3 => 2.4
- [ ]   2.3 => 3.0
- [ ]   2 => 3
- [ ]   2.3.4.5 => 2.3.4.${{ github.run_number }}
- [ ]   2.3.4.5 => 2.3.4.Alpha
- [ ]   2.3 => 2.${{ github.run_number }}
- [ ]   2.3.4.5 => 3.Alpha.5..${{ github.run_number }}

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
