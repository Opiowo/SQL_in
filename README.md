# SQL IN() Formatter

A VS Code extension that turns a list of values, one per line, into a SQL `IN()` clause — with or without quotes.

## How To Use
1. Create a new editor window
2. Paste a list separated by new lines
3. Highlight the items in the list you want in the `IN()` statement
4. `Ctrl+Shift+P` to bring up the VS Code Command Palette
5. Type: `SQL IN() Statement`
6. Choose `With Quotes` or `Without Quotes`

## Creating an IN() Statement with Quotes
![SQL IN Statement with Quotes](With_Quotes.gif)

## Creating an IN() Statement without Quotes
![SQL IN Statement without Quotes](Without_Quotes.gif)

## Settings

Configure these under `SQL IN() Formatter` in VS Code Settings (`sqlIn.*`):

| Setting | Default | Description |
| --- | --- | --- |
| `sqlIn.trimValues` | `true` | Trim leading/trailing whitespace from each value before quoting. |
| `sqlIn.skipEmptyLines` | `true` | Skip lines that are empty or contain only whitespace. |
| `sqlIn.removeDuplicates` | `false` | Remove duplicate values, keeping the first occurrence. |

**Enjoy!**

---

This project started as a fork of [sql-in-statements](https://github.com/edwardpcharles/sql-in-statements) by Edward Charles (MIT licensed) — thank you for the original idea and implementation.
