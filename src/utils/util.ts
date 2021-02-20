import { GitCommit } from "../server.d";

export function getPropertyValue<T, K extends keyof T>(config: T, index: K): T[K] {
    return config[index]
}
export function hasPropertyValue<T, K extends keyof T>(config: T, index: K): boolean {
    return !!config[index]
}
export function updatePropertyValue<T, K extends keyof T>(config: T, index: K, value: T[K]): T[K] {
    return config[index] = value;
}
export function beautifyCommits(payload: any): string {
    const commits: Array<GitCommit> = payload.commits;
    const orderedCommits = [];
    commits.length = commits.length > 10 ? 10: commits.length;
    for(let i = 0; i < commits.length; i++) {
      const [id, message, author] = LinearizeCommit(`${commits[i].id.slice(0, 7)}|${commits[i].message}|-|${commits[i].author.name}`);
        orderedCommits.push(`[\`\`${id}\`\`](${payload.repository.html_url}/commits/${commits[i].id}) ${message}- ${author}`)
    }
    return orderedCommits.join("\n")
}

function LinearizeCommit(sentence: string): Array<string> {
    // eslint-disable-next-line prefer-const
    let [id, message, separator, auteur] = sentence.split("|");
    if(id.length + message.length + separator.length + auteur.length > 73){
      do {
         message = message.split("").slice(0, -1).join("")
      } while(id.length + message.length + separator.length + auteur.length > 70);
      message = `${message}... `
    }
    return [id, message, auteur];
  }
