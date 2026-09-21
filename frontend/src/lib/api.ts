export async function apiFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.replace("/login");
  }

  return response;
}
