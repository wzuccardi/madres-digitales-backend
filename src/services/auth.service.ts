import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import { CrearUsuarioDTO, LoginDTO } from '../types/usuario.dto';
import { tokenService } from './token.service';
import { log } from '../config/logger';

export class AuthService {
	async register(data: CrearUsuarioDTO) {
		const hashedPassword = await bcrypt.hash(data.password, 10);
		 const user = await prisma.usuario.create({
			data: {
				email: data.email,
				password_hash: hashedPassword,
				nombre: data.nombre,
				documento: data.documento,
				telefono: data.telefono,
				rol: data.rol,
				municipio_id: data.municipioId,
				// direccion: data.direccion, // Field not in schema
			},
		});
		return user;
	}

	async login(data: LoginDTO) {
		log.auth('Login attempt', { email: data.email });

		const user = await prisma.usuario.findUnique({
			where: { email: data.email },
		});

		if (!user) {
			log.security('Login failed: User not found', { email: data.email });
			return null;
		}

		if (!user.activo) {
			log.security('Login failed: User inactive', { email: data.email, userId: user.id });
			return null;
		}

		const valid = await bcrypt.compare(data.password, user.password_hash);

		if (!valid) {
			log.security('Login failed: Invalid password', { email: data.email, userId: user.id });
			return null;
		}

		// Generar tokens
		const tokens = tokenService.generateTokenPair({
			id: user.id,
			email: user.email,
			rol: user.rol,
		});

		// Guardar refresh token
		await tokenService.saveRefreshToken(user.id, tokens.refreshToken);

		log.auth('Login successful', { userId: user.id, email: user.email, rol: user.rol });

		return {
			user,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		};
	}

	async findUserById(id: string) {
		console.log('🔍 AuthService: Looking for user with ID:', id);

		const user = await prisma.usuario.findUnique({
			where: { id },
		});

		console.log('👤 AuthService: User found:', user ? `Yes (${user.nombre})` : 'No');
		return user;
	}

	async listUsers() {
		const users = await prisma.usuario.findMany({
			select: {
				id: true,
				email: true,
				nombre: true,
				documento: true,
				telefono: true,
				rol: true,
				municipio_id: true,
				// direccion: true, // Field not in schema
				activo: true,
				ultimo_acceso: true,
				created_at: true,
				updated_at: true
			}
		});
		return users;
	}

	async logout(userId: string) {
		log.auth('Logout', { userId });
		await tokenService.revokeRefreshTokens(userId);
		return { success: true };
	}

	async refreshToken(refreshToken: string) {
		log.auth('Refresh token attempt');
		const tokens = await tokenService.refreshAccessToken(refreshToken);
		return tokens;
	}
}
