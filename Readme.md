# prior-inventions-list

This is a simple tool to generate a Markdown list of GitHub repositories
that can be used to create an addendum document when signing a job offer
contract that requires listing of prior inventions.

In general:

```sh
$ cp .env.sample .env
$ # edit .env to include a token for your account
$ node index.mjs > inventions.md
$ # edit inventions.md to include any other information you would like
$ pandoc -o inventions.pdf inventions.md
```
