// Mock storage compartido entre todas las rutas API
export const users = new Map<string, { 
  id: string; 
  name: string; 
  email: string; 
  password: string;
}>();

export const sessions = new Map<string, string>(); // sessionToken -> email

// Añadir usuario de prueba
users.set('test@test.com', {
  id: 'user_1',
  name: 'Test User',
  email: 'test@test.com',
  password: 'password123'
});
