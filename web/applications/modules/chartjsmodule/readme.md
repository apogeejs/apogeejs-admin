to deploy:

npm run-script buildmodule - create a release of the module
npm run-script buildlib - converts ChartJS  from npm to es module. Needed to debug (and as a result, compile) the module

NOTES

1) For a release of the module, two items in package.json must be updated:

- "officialRelease": false - Whether the release goes in the releases folder or the releases-dev folder.
- "version": "1.0.0-p2" - The release number

On completing release, the field "officialRelease" should be set to false, to stop us from accidentally overwriting a
saved release. (Ideally we should put in a error/warning to prevent overwriting a file.)