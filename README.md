# dotnet-bump-version

A GitHub Action to easily bump .NET Core project version files(.csproj).

-   Bumps the version number in the provided version files(default \*_/_.csproj).
-   Push changes to the repository that triggered a workflow.

This action program only supports "push" events.

## Usage

<!-- start usage -->

```yaml
- uses: SiqiLu/dotnet-bump-version@master
  with:
      # Version files to bump version.
      # You can use Glob pattern string (like "**/*.csproj") or Glob patterns array json string (like "["**/*.csproj", "v1.version", "**/*.version.json", "!v2.version.json"]").
      # Patterns supported by Globby are supported.Leading ! changes the meaning of an include pattern to exclude.
      version_file: \*_/_.csproj

      github_token: ${{ secrets.GITHUB_TOKEN }}
```

<!-- end usage -->

## Example usage

```yaml
name: .NET Build

on: [push]

jobs:
    build:
        runs-on: windows-latest

        steps:
            - uses: actions/checkout@v2
            - name: Setup .NET Core
              uses: actions/setup-dotnet@v1
              with:
                  dotnet-version: 3.1.x
            - name: Install dependencies
              run: dotnet restore
            - name: Build
              run: dotnet build --configuration Release --no-restore
            - name: Bump versions
              uses: SiqiLu/dotnet-bump-version@master
              with:
                  version_files: "**/*.csproj"
                  github_token: ${{ secrets.GITHUB_TOKEN }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
