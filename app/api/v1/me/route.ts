import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { users, sessions } from '../storage';

export async function GET(request: NextRequest) {
  try {
    // Obtener token de sesión de la cookie
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Buscar sesión
    const email = sessions.get(sessionToken);
    
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Buscar usuario
    const user = users.get(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Devolver usuario sin password
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
