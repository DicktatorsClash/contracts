# Dicktators Clash Contrcats

### Compilation

To compile the contracts, use the next script:

```bash
npm run compile
```

### Test

To run the tests, execute the following command:

```bash
npm run test
```

Or to see the coverage, run:

```bash
npm run coverage
```

### Config files

The configuration file example can be found in the `configs` directory.

To create a real configuration file, you need to copy the example file and name it as `<network>.config.json`.
Where `<network>` is the name of the network from the `hardhat.config.ts` you want to deploy to.

### Local deployment

To deploy the contracts locally, run the following commands (in the different terminals):

```bash
npm run private-network
npm run deploy-localhost
```

#### Bindings

The command to generate the bindings is as follows:

```bash
npm run generate-types
```

> See the full list of available commands in the `package.json` file.
