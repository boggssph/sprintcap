/**
 * Jira API service for capacity planning integration
 * Handles communication with Jira REST API v2 for ticket management
 */

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    assignee?: {
      emailAddress: string;
      displayName: string;
    };
    created: string;
    updated: string;
  };
}

interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
}

export class JiraService {
  private baseUrl: string;
  private email: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = process.env.JIRA_BASE_URL || '';
    this.email = process.env.JIRA_EMAIL || '';
    this.apiToken = process.env.JIRA_API_TOKEN || '';

    if (!this.baseUrl || !this.email || !this.apiToken) {
      throw new Error('Jira environment variables not configured');
    }
  }

  /**
   * Get authentication headers for Jira API requests
   */
  private getAuthHeaders(): HeadersInit {
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Search for issues in Jira using JQL
   */
  async searchIssues(jql: string, fields?: string[]): Promise<JiraIssue[]> {
    const defaultFields = ['summary', 'description', 'status', 'assignee', 'created', 'updated'];
    const searchFields = fields || defaultFields;

    const url = new URL(`${this.baseUrl}/rest/api/2/search`);
    url.searchParams.set('jql', jql);
    url.searchParams.set('fields', searchFields.join(','));

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
      }

      const data: JiraSearchResponse = await response.json();
      return data.issues;
    } catch (error) {
      console.error('Error searching Jira issues:', error);
      throw new Error('Failed to search Jira issues');
    }
  }

  /**
   * Get a specific issue by key
   */
  async getIssue(issueKey: string): Promise<JiraIssue | null> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/2/issue/${issueKey}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error getting Jira issue ${issueKey}:`, error);
      throw new Error(`Failed to get Jira issue ${issueKey}`);
    }
  }

  /**
   * Create a new issue in Jira
   */
  async createIssue(projectKey: string, summary: string, description?: string): Promise<JiraIssue> {
    const issueData = {
      fields: {
        project: {
          key: projectKey,
        },
        summary,
        description,
        issuetype: {
          name: 'Task', // Default to Task type
        },
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/rest/api/2/issue`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Jira issue:', error);
      throw new Error('Failed to create Jira issue');
    }
  }

  /**
   * Update an existing issue in Jira
   */
  async updateIssue(issueKey: string, updates: Partial<JiraIssue['fields']>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/2/issue/${issueKey}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ fields: updates }),
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error updating Jira issue ${issueKey}:`, error);
      throw new Error(`Failed to update Jira issue ${issueKey}`);
    }
  }

  /**
   * Delete an issue from Jira
   */
  async deleteIssue(issueKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/2/issue/${issueKey}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting Jira issue ${issueKey}:`, error);
      throw new Error(`Failed to delete Jira issue ${issueKey}`);
    }
  }

  /**
   * Get issues assigned to a specific user
   */
  async getIssuesByAssignee(assigneeEmail: string): Promise<JiraIssue[]> {
    const jql = `assignee = "${assigneeEmail}"`;
    return this.searchIssues(jql);
  }

  /**
   * Get issues by status
   */
  async getIssuesByStatus(status: string): Promise<JiraIssue[]> {
    const jql = `status = "${status}"`;
    return this.searchIssues(jql);
  }

  /**
   * Get issues for a specific project
   */
  async getIssuesByProject(projectKey: string): Promise<JiraIssue[]> {
    const jql = `project = "${projectKey}"`;
    return this.searchIssues(jql);
  }

  /**
   * Test connection to Jira API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/2/myself`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Jira connection test failed:', error);
      return false;
    }
  }
}

// Export lazy-initialized singleton instance
let jiraServiceInstance: JiraService | null = null;

export const jiraService = {
  getInstance(): JiraService {
    if (!jiraServiceInstance) {
      jiraServiceInstance = new JiraService();
    }
    return jiraServiceInstance;
  }
};