// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { authService } from '../../../lib/services/auth-service';
import { handleApiError, createApiResponse, AppError } from 'lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const authData = await authService.signIn(email, password);

    return createApiResponse({
      user: authData.user,
      session: authData.session,
    });

  } catch (error) {
    return handleApiError(error);
  }
}
