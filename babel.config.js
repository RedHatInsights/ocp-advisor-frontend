const path = require('path');
const glob = require('glob');

const mapper = {
  TextVariants: 'Text',
  DropdownPosition: 'dropdownConstants',
  //TextListVariants: 'TextList',
  //TextListItemVariants: 'TextListItem'
};

module.exports = {
  presets: [
    // Polyfills
    '@babel/env',
    // Allow JSX syntax
    '@babel/react',
  ],
  plugins: [
    // Put _extends helpers in their own file
    '@babel/plugin-transform-runtime',
    // Support for {...props} via Object.assign({}, props)
    '@babel/plugin-proposal-object-rest-spread',
    // Devs tend to write `import { someIcon } from '@patternfly/react-icons';`
    // This transforms the import to be specific which prevents having to parse 2k+ icons
    // Also prevents potential bundle size blowups with CJS
    [
      'transform-imports',
      {
        '@patternfly/react-core': {
          transform: (importName) => {
            let res;
            const files = glob.sync(
              path.resolve(
                __dirname,
                `./node_modules/@patternfly/react-core/dist/js/**/${
                  mapper[importName] || importName
                }.js`
              )
            );
            if (files.length > 0) {
              res = files[0];
            } else {
              throw `File with importName ${importName} does not exist`;
            }

            res = res.replace(path.resolve(__dirname, './node_modules/'), '');
            res = res.replace(/^\//, '');
            return res;
          },
          preventFullImport: false,
          skipDefaultConversion: true,
        },
      },
      'react-core',
    ],
    [
      'transform-imports',
      {
        '@patternfly/react-icons': {
          transform: (importName) =>
            `@patternfly/react-icons/dist/js/icons/${importName
              .split(/(?=[A-Z])/)
              .join('-')
              .toLowerCase()}`,
          preventFullImport: true,
        },
      },
      'react-icons',
    ],
    [
      'formatjs',
      {
        idInterpolationPattern: '[sha512:contenthash:base64:6]',
        ast: true,
      },
    ],
  ],
};
