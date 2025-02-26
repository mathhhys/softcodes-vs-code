const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

export async function accessSecret(projectId: string, secretName: string, versionName: string = 'latest'): Promise<string> {
  try {
    console.log("Initializing Secret Manager client...");
    const client = new SecretManagerServiceClient();

    const name = `projects/${projectId}/secrets/${secretName}/versions/${versionName}`;
    console.log("Accessing secret:", name);

    // Check if the secret exists
    const [secret] = await client.getSecret({ name: `projects/${projectId}/secrets/${secretName}` });
    if (!secret) {
      throw new Error('Secret does not exist');
    }

    const [version] = await client.accessSecretVersion({ name: name });
    if (!version.payload || !version.payload.data) {
      throw new Error('Secret payload is empty');
    }

    const secretValue = version.payload.data.toString();
    console.log("Secret retrieved successfully:", secretValue);
    return secretValue;
  } catch (error) {
    // Ensure error is of type Error
    const err = error as Error;
    console.error('Error accessing secret:', err.message);

    if (err.name === 'PermissionDenied') {
      console.error('Permission denied. Ensure the service account has the necessary roles.');
    } else if (err.name === 'NotFound') {
      console.error('Secret not found. Verify the secret name and version.');
    }
    throw err;
  }
}
