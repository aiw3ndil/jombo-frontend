import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { users, sessions } from '../storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user } = body;
    
    if (!user || !user.email || !user.password || !user.name) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    if (users.has(user.email)) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const id = `user_${Date.now()}`;
    const newUser = {
      id,
      name: user.name,
      email: user.email,
      password: user.password // En producción, esto debe ser hasheado
    };
    
    users.set(user.email, newUser);

    // Crear sesión
    const sessionToken = `session_${Date.now()}_${Math.random()}`;
    sessions.set(sessionToken, user.email);

    // Crear response con usuario (sin password)
    const response = NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token: sessionToken
    });

    // Establecer cookie de sesión
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
