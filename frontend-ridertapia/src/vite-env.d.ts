interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_USAR_API?: string;

}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}