import { supabase } from "@/lib/supabase";
import * as Crypto from "expo-crypto";

export const registerUser = async (data: {
    numUsuario: number;
    nombre: string;
    email: string;
    password: string;
    telefono: string;
    numRol: number;
    numTipo: number;
    imagen?: string;
}) => {
    try {
        const hashedPassword = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            data.password
        );

        const { data: existing } = await supabase
            .from("usuarios")
            .select("numusuario")
            .eq("numusuario", data.numUsuario)
            .maybeSingle();

        if (existing) {
            throw new Error("El número de usuario ya existe");
        }

        const { data: user, error } = await supabase
            .from("usuarios")
            .insert([
                {
                    numusuario: data.numUsuario,
                    nombre: data.nombre,
                    email: data.email,
                    telefono: data.telefono,
                    password: hashedPassword,
                    imagen: data.imagen ?? null,
                    numrol: data.numRol,
                    numtipo: data.numTipo,
                },
            ])
            .select("*")
            .single();

        if (error) throw error;

        return user;
    } catch (error: any) {
        console.log("ERROR registerUser:", error.message);
        throw error;
    }
};