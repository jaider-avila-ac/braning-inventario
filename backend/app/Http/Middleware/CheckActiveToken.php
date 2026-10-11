<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveToken
{
    private const ALIVE_TTL = 300; // 5 minutos en segundos

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if (!$user->is_activo) {
            return response()->json([
                'message' => 'Usuario desactivado. Contacta al administrador.',
                'code'    => 'USER_INACTIVE',
            ], 401);
        }

        $token = $user->currentAccessToken();
        if (!$token) {
            return response()->json([
                'message' => 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                'code'    => 'TOKEN_REVOKED',
            ], 401);
        }

        $aliveKey = "session:alive:{$token->id}";

        // 1. Inactividad — sin actividad en 5 minutos
        if (!Cache::has($aliveKey)) {
            $token->delete();
            return response()->json([
                'message' => 'Sesión expirada por inactividad. Por favor, inicia sesión nuevamente.',
                'code'    => 'SESSION_TIMEOUT',
            ], 401);
        }

        // 2. Renovar el temporizador de inactividad
        Cache::put($aliveKey, true, self::ALIVE_TTL);

        return $next($request);
    }
}
