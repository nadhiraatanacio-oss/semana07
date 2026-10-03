import userRepository from '../repositories/UserRepository.js';
import authService from '../services/AuthService.js';

export default async function seedUsers() {
    const email = 'admin@tecsup.edu.pe';
    const existing = await userRepository.findByEmail(email);

    if (!existing) {
        await authService.signUp({
            email,
            password: 'Admin#2026',
            name: 'Administrador',
            lastName: 'General',
            phoneNumber: '987654321',
            birthdate: '1995-05-10',
            address: 'Av. Cascanueces 2221, Santa Anita',
            roles: ['admin']
        });
        console.log('Seeded admin: admin@tecsup.edu.pe / Admin#2026');
    }
}