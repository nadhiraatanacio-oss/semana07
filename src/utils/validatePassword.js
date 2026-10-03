// Mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 caracter especial (# $ % & * @)
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$%&*@]).{8,}$/;

export default function validatePassword(password) {
    if (!password || !PASSWORD_REGEX.test(password)) {
        const err = new Error('El password debe tener mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 caracter especial (# $ % & * @)');
        err.status = 400;
        throw err;
    }
}