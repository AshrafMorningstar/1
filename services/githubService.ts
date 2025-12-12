/*
 * © 2022-2026 Ashraf Morningstar
 * GitHub: https://github.com/AshrafMorningstar
 *
 * This project is a personal recreation of existing projects, developed by Ashraf Morningstar 
 * for learning and skill development. Original project concepts remains the intellectual 
 * property of their respective creators.
 */
import { GithubFile } from '../types';

interface GitRef {
  ref: string;
  node_id: string;
  url: string;
  object: {
    type: string;
    sha: string;
    url: string;
  };
}

export class GithubService {
  private token: string;
  private owner: string;
  private repo: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string, owner: string, repo: string) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API Error ${response.status}: ${errorBody.message || response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async verifyRepo(): Promise<boolean> {
    try {
      await this.request('');
      return true;
    } catch (e) {
      return false;
    }
  }

  async createRepo(description: string): Promise<void> {
    // This endpoint is different (not under /repos/owner/repo)
    const url = `${this.baseUrl}/user/repos`;
    await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: this.repo,
            description,
            private: false,
            auto_init: true
        })
    });
  }

  async getRef(ref: string): Promise<GitRef> {
    return this.request<GitRef>(`/git/ref/${ref}`);
  }

  async createRef(ref: string, sha: string): Promise<void> {
    await this.request('/git/refs', {
      method: 'POST',
      body: JSON.stringify({
        ref,
        sha,
      }),
    });
  }

  async getCommit(sha: string): Promise<{ tree: { sha: string } }> {
    return this.request<{ tree: { sha: string } }>(`/git/commits/${sha}`);
  }

  async createBlob(content: string): Promise<string> {
    const res = await this.request<{ sha: string }>('/git/blobs', {
      method: 'POST',
      body: JSON.stringify({
        content,
        encoding: 'utf-8',
      }),
    });
    return res.sha;
  }

  async createTree(baseTreeSha: string, files: { path: string; content: string }[]): Promise<string> {
    // First create blobs for all files
    const treeItems = [];
    for (const file of files) {
      const blobSha = await this.createBlob(file.content);
      treeItems.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobSha,
      });
    }

    const res = await this.request<{ sha: string }>('/git/trees', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    });
    return res.sha;
  }

  async createCommit(
    message: string,
    treeSha: string,
    parentSha: string,
    date: Date,
    coAuthors: string[] = []
  ): Promise<string> {
    const isoDate = date.toISOString();
    
    // Append co-authors to message if present
    let fullMessage = message;
    if (coAuthors.length > 0) {
        fullMessage += '\n\n' + coAuthors.map(author => `Co-authored-by: ${author}`).join('\n');
    }

    const res = await this.request<{ sha: string }>('/git/commits', {
      method: 'POST',
      body: JSON.stringify({
        message: fullMessage,
        tree: treeSha,
        parents: [parentSha],
        author: {
          name: this.owner, // Best effort
          email: `${this.owner}@users.noreply.github.com`,
          date: isoDate,
        },
        committer: {
          name: this.owner,
          email: `${this.owner}@users.noreply.github.com`,
          date: isoDate,
        },
      }),
    });
    return res.sha;
  }

  async updateRef(ref: string, sha: string): Promise<void> {
    await this.request(`/git/refs/${ref}`, {
      method: 'PATCH',
      body: JSON.stringify({
        sha,
        force: true, // Force update to move the pointer
      }),
    });
  }

  async createIssue(title: string, body: string, labels: string[] = []): Promise<number> {
    const res = await this.request<{ number: number }>('/issues', {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        labels,
      }),
    });
    return res.number;
  }

  async createPullRequest(title: string, head: string, base: string, body: string): Promise<number> {
    const res = await this.request<{ number: number }>('/pulls', {
        method: 'POST',
        body: JSON.stringify({
            title,
            head,
            base,
            body
        })
    });
    return res.number;
  }

  async mergePullRequest(pullNumber: number): Promise<void> {
      await this.request(`/pulls/${pullNumber}/merge`, {
          method: 'PUT',
          body: JSON.stringify({
              merge_method: 'squash'
          })
      });
  }
}