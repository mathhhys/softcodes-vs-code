

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

export async function accessSecret(projectId: string, secretName: string, versionName: string = 'latest'): Promise<string> {
    try {
      const client = new SecretManagerServiceClient();
      const name = `projects/${projectId}/secrets/${secretName}/versions/${versionName}`;
      const [version] = await client.accessSecretVersion({ name: name });
      return version.payload.data.toString();
    } catch (error) {
      console.error('Error accessing secret:', error);
      throw error;
    }
}
