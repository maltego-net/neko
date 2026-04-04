const API_URL = process.env.REACT_APP_API_URL;

export function connectTwitter() {
  window.location.href = `${API_URL}/auth/twitter2`;
}

export async function fetchMe() {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json(); 
}

export async function fetchQuests() {
  const res = await fetch(`${API_URL}/quests`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Autorization error');
  return res.json(); 
}


export async function completeQuest(id) {
  const res  = await fetch(`${API_URL}/quests/${id}/complete`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Complete quest failed');
  return data;
}

export async function saveWallet(wallet) {
  const res = await fetch(`${API_URL}/quests/wallet`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet }),
  });
  if (!res.ok) throw new Error('Save wallet failed');
  return res.json(); 
}