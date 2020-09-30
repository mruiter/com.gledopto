# eslint-config-athom
ESLint config for Athom B.V. JavaScript projects.

## Usage

In your JavaScript project:

```bash
$ npm install --save-dev eslint eslint-config-athom
```

Then create a file `/.eslintrc.json` in your project's root:

```javascript
{
  "extends": "athom"
}
```

Now, edit your project's `/package.json` file to contain the following:

```json
"engines": {
  "node": ">=12.16.1"
}
```
