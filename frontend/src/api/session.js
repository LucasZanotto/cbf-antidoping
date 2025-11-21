export function getAuth() {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  return { token, user: userStr ? JSON.parse(userStr) : null };
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}
