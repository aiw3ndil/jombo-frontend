import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { users, sessions } from '../storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user } = body;
    
    if (!user || !user.email || !user.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const foundUser = users.get(user.email);
    
    if (!foundUser || foundUser.password !== user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Crear sesión
    const sessionToken = `session_${Date.now()}_${Math.random()}`;
    sessions.set(sessionToken, user.email);

    // Crear response con usuario (sin password)
    const response = NextResponse.json({
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
