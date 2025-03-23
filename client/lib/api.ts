// src/lib/api.ts
const API_URL = 'http://localhost:3000/api';

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/questioner/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  const data = await response.json();
  return data.url;
};

export const saveQuestion = async (question: any) => {
  const response = await fetch(`${API_URL}/questioner/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(question)
  });
  return response.json();
};

export const getQuestions = async () => {
  const response = await fetch(`${API_URL}/questioner/questions`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};