# Change Log

All notable changes to the "sql-in" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0]

- First Marketplace release, published as `keshu`
- Added a "Double Single Quotes" quote style (`''value''`) for use inside an `OPENQUERY` string literal
- Added the `SQL VALUES() Statement` command, turning a selection into a TSQL `VALUES()` statement with a configurable column delimiter (`sqlIn.valuesDelimiter`)
- New icon

## [0.1.0]

- Forked from [sql-in-statements](https://github.com/edwardpcharles/sql-in-statements)
- Added `sqlIn.trimValues` setting to trim whitespace from each value before quoting
- Added `sqlIn.skipEmptyLines` setting to skip empty/whitespace-only lines
- Added `sqlIn.removeDuplicates` setting to drop duplicate values

## [Unreleased] (upstream)

- Initial release
- Updated background color in package
- Updated Readme