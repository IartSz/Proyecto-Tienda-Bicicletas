export type Rol = 'CLIENTE' | 'ADMIN';

export interface Usuario {
    rutUsuario: string;
    emailCliente: string;
    password: string; // se guarda con hash, nunca en texto plano
    rol: Rol;
    activo?: boolean;
    fechaCreacion?: string;
}

export interface Cliente {
    rutUsuario: string;
    nombre: string;
    apellido: string;
    telefono: string | null;
}

// Datos de la sesion iniciada
export type Sesion = Omit<Usuario, 'password'> &Omit<Cliente, 'rutUsuario'>;

// Datos del formulario de registro
export type RegistroPayload = Pick<Usuario, 'rutUsuario' | 'emailCliente' | 'password'> & Pick<Cliente, 'nombre' | 'apellido'>;