# govKit - a light-weight Drupal 7 theme base on the Australian Government Design System

https://designsystem.gov.au/

## Getting started
1. Run `npm install`. This may take a while and if it stalls, delete the `node_modules` directory and start over
2. Copy `config-local-example.json` to `config-local.json` and change the browserSync proxy to your local development URL

## Source files

Default source file directories are

* SCSS source files `src/scss`
* JS source files `src/js`
* Image source files `src/images`
* The UI Kit source files are here `src/uikit`

Those can be changed to your liking by editing `config.json`. All source files with `.js` and `.scss` extensions under their respective directory will be compiled. This may not be desirable if you would like to control the order the SCSS files are included. Edit `config.json` accordingly if you would like to specify the include order of the source files.

## Tasks

### Production deployment

From the theme directory, run `gulp`

**It does the following:**
* compile SCSS and JS source files
* optimise image source files
* compress CSS
* monify JS

You may choose to enable/disable image optimisation by editing `gulpfile.js`. If task `images` is enabled, the task may take a while to run, please be patient.

### Development

From the theme directory, run `gulp dev`

**It does the following:**
* source mapping for both SCSS and JS
* watch for SCSS and JS source file changes
* compile SCSS into CSS nested style
* output un-minified JS
* launch browserSync 

### JS Linting

From the theme directory, run `gulp js-lint`

