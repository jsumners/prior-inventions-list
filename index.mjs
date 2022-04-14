import dotenv from 'dotenv'
dotenv.config()

import {Client} from 'undici'
const client = new Client('https://api.github.com')
const headers = {
  'user-agent': 'fastify/deprecator',
  accept: 'application/vnd.github.v3+json',
  authorization: `token ${process.env.GITHUB_TOKEN}`,
  'content-type': 'application/json'
}

const getRepos = getReposGen()
for await (const repo of getRepos) {
  if (repo.fork === true) continue
  console.log(`+ **${repo.name}**: ${repo.html_url}`)
}


/**
 * Iterates the full list of repositories in the Fastify organization.
 *
 * @yields {object} GitHub repository object.
 */
 async function * getReposGen() {
  const params = new URLSearchParams()
  params.set('type', 'owner')
  params.set('sort', 'full_name')
  params.set('per_page', '100')

  let response = await client.request({
    method: 'GET',
    path: '/user/repos?' + params.toString(),
    headers
  })

  const firstPage = await response.body.json()
  for (const repo of firstPage) {
    yield repo
  }

  let finished = false
  do {
    if (!response.headers.link) {
      break;
    }

    // On the first page there will be `rel=next` and `rel=last`.
    // On middle pages there will be `rel=prev`, `rel=next`, and `rel=first`.
    // On the last page there will be `rel=prev` and `rel=first`.
    const links = response.headers.link.split(',');
    const nextLink = links.find((l) => l.includes(`rel="next"`));
    if (!nextLink) {
      finished = true;
      break;
    }

    const parts = nextLink.split(';');
    const url = new URL(parts[0].replace(/[<>]/g, ''));
    // const rel = parts[1].slice(6, -1);

    response = await client.request({
      method: 'GET',
      path: url.pathname + url.search,
      headers
    })
    const repos = await response.body.json()
    for (const repo of repos) {
      yield repo
    }
  } while (finished === false)
}
