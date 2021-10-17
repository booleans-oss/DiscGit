import { GitCommit } from "../server.d";
import path from 'path'
import fs from 'fs'
/**
 * Get the value of property in object
 * @param {T} object - Object
 * @param {K} index - Key in object
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
 * @param {T} object - Object
 * @param {K} index - Key in object
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
 * @param {T} object - Object
 * @param {K} index - Key in object
 * @param {T[K]} value - New value
 * @return {T[K]} new value in objet at property K
 */
export function updatePropertyValue<T, K extends keyof T>(
  object: T,
  index: K,
  value: T[K]
): T {
  object[index] = value
  return object;
}

/**
 * Beautify the commit list in Github Payload
 * @param {Object} payload - Github Payload of the request
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
 * @param {String} sentence - Sentence that needs to be reduced
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

/**
 * Resolve if the type is repository or not
 * @param {string} type - Type of the repository/organization
 * @returns {boolean} if repo is a repo or an organization 
 */
export function isRepo(type: string): boolean {
  return type === 'repository'
}


/**
 * Resolve extension of the config file and verify if it is valid
 * @returns {string} Extension of the configuration file
 * @throws if configuration file was not found or language extension is not valid
 */
export function resolveConfigPath(): string {
  const ConfigFile = fs.readdirSync(process.cwd()).find(file => file.startsWith('discgit.config.'));
  if(!ConfigFile) throw new Error(`No config file found`);
  const extension: string = ConfigFile.split(".")[2];
  if(!["js", "json"].includes(extension)) throw new Error(`Invalid configuration file extension`);
  return path.join(process.cwd(), ConfigFile);
}