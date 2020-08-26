# Yarn deduplicate CLI

Bundled package of [yarn-deduplicate](https://github.com/atlassian/yarn-deduplicate) CLI with some patches;
To clean up `yarn.lock` by removing duplicates.

## Patches

- Bundle `yarn-deduplicate` CLI with `webpack` and `babel` for Node 6 compatibility
- Now we can guess duplicatable packages with `--scopes` option special values: '^', '~', and '\*'

## Usage

Guess duplicatable packages with:

```bash
yarn-deduplicate -l --scopes "^" path/to/yarn.lock
```

This will list all duplicatable packages then we can deduplicate them manually.

## License

Apache 2.0 licensed, see [LICENSE.txt](LICENSE.txt) file.
