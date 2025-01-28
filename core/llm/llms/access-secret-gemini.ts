import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function accessSecret(projectId: string, secretName: string): Promise<string> {
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();

    if (!payload) {
      throw new Error('Failed to retrieve secret payload');
    }

    return payload;
  } catch (error) {
    console.error('Error accessing secret:', error);
    throw error;
  }
}