# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Continuous integration

The [Validate grids and game sessions](.github/workflows/validate-grid-calendar.yml) workflow runs on **every pull request**, on pushes to `main`, and manually via **Actions → Validate grids and game sessions → Run workflow**.

- `validate`: UTC calendar tests (`npm run test:calendar`) and puzzle catalog validation (`npm run validate:grids`).
- `session`: `npm ci`, TypeScript (`npx tsc --noEmit`), Jest (`CI=true npm test -- --watch=false --runInBand`), and production build (`CI=true npm run build`).

Both jobs must succeed before merging. To **enforce** this in GitHub, configure branch protection / repository rules for `main`: require a pull request and require the status checks **`validate`** and **`session`** to pass. GitHub Actions alone reports results but does not prevent merging if no rule is enabled. Rules are administered in GitHub repository settings and are not changed by this PR.

Locally, run `npm ci` followed by the commands above to reproduce the checks.
