import { GitCommit } from "../server.d";

/**
 * Get the value of property in object
 * @param {T} Object
 * @param {K} key in object
 * @return {T[K]} Value of property in object {@link T}
 */
export function getPropertyValue<T, K extends keyof T>(
  object: T,
  index: K
): T[K] {
  return object[index];
}

/**
 * Check if object has a property
 * @param {T} Object
 * @param {K} key in object
 * @return {boolean} If key K exists on object T
 */
export function hasPropertyValue<T, K extends keyof T>(
  object: T,
  index: K
): boolean {
  return !!object[index];
}

/**
 * Update key in object
 * @param {T} Object
 * @param {K} key in object
 * @param {T[K]} new value
 * @return {T[K]} new value in objet at property K
 */
export function updatePropertyValue<T, K extends keyof T>(
  object: T,
  index: K,
  value: T[K]
): T[K] {
  return (object[index] = value);
}

/**
 * Beautify the commit list in Github Payload
 * @param {GithubPayload} Payload of the request
 * @return {string} Beautified commit list
 */
export function beautifyCommits(payload: any): string {
  const commits: Array<GitCommit> = payload.commits;
  const orderedCommits = [];
  commits.length = commits.length > 10 ? 10 : commits.length;
  for (let i = 0; i < commits.length; i++) {
    const [id, message, author] = LinearizeCommit(
      `${commits[i].id.slice(0, 7)}|${commits[i].message}|-|${
        commits[i].author.name
      }`
    );
    orderedCommits.push(
      `[\`\`${id}\`\`](${payload.repository.html_url}/commits/${commits[i].id}) ${message}- ${author}`
    );
  }
  return orderedCommits.join("\n");
}

/**
 * Linearized the commit list in Github Payload
 * Setting maximum of 73 characters in order to have commit description in one line
 * Cropping the commit title in order to make space
 * @param {GithubPayload} Payload of the request
 * @return {string} Linear commit list
 */
function LinearizeCommit(sentence: string): Array<string> {
  // eslint-disable-next-line prefer-const
  let [id, message, separator, auteur] = sentence.split("|");
  if (id.length + message.length + separator.length + auteur.length > 73) {
    do {
      message = message.split("").slice(0, -1).join("");
    } while (
      id.length + message.length + separator.length + auteur.length >
      70
    );
    message = `${message}... `;
  }
  return [id, message, auteur];
}


export function isRepo(type: string): boolean {
  return type === 'repository'
}
