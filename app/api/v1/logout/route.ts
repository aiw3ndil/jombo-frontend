import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Eliminar cookie de sesión
  response.cookies.delete('session_token');
  
  return response;
}
