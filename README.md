# GB auto copyright comments

This is a vscode extension that generates or updates copyright comments automatically for Flarum
extensions source code.

## Features

Uses a (currently hardcoded) copyright comment template to generate and insert (or update) copyright
comments at the beginning of source code files of the following languages:

-   `php`
-   `javascript`
-   `typescript`

(The list of these languages is currently hardcoded, it might become a setting in the future).

Currently the template is hardcoded (it might become a setting in the future):

```js
/*
 * This file is part of {package-name}.
 *
 * Copyright (c) {year} Glowing Blue AG.
 * Authors: {authors}.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */
```

And also the whitelisted paths are hardcoded:

```json
["/src", "/tests", "/js/src/forum", "/js/src/admin", "/js/src/common", "/migrations", "/extend.php"]
```

## Future improvements

-   Add settings for hard-coded constants
-   Add an easy way of disabling this extension for a certain file or time... (for now you can just
    disable the extension and save the file that needs to be saved without this extension messing it
    up)
