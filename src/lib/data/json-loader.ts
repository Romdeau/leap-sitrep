export async function loadPublicJson<T>(relativePath: string): Promise<T> {
  const path = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  const response = await fetch(`${import.meta.env.BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Failed to load '${relativePath}' (${response.status}).`);
  }

  return (await response.json()) as T;
}
