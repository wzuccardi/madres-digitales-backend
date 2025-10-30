// Servicio de caché en memoria para reportes
// Almacena reportes en caché con expiración configurable

interface CacheItem {
    data: any;
    expira: Date;
    creado: Date;
}

export class CacheService {
    private cache = new Map<string, CacheItem>();
    private estadisticas = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0
    };

    /**
     * Guardar datos en caché
     * @param key Clave única del caché
     * @param data Datos a guardar
     * @param minutosExpiracion Minutos hasta que expire (default: 30)
     */
    set(key: string, data: any, minutosExpiracion: number = 30): void {
        const ahora = new Date();
        const expira = new Date(ahora.getTime() + minutosExpiracion * 60000);

        this.cache.set(key, {
            data,
            expira,
            creado: ahora
        });

        this.estadisticas.sets++;
        console.log(`💾 CacheService: Guardado en caché [${key}] - Expira en ${minutosExpiracion} min`);
    }

    /**
     * Obtener datos del caché
     * @param key Clave del caché
     * @returns Datos si existen y no han expirado, null en caso contrario
     */
    get(key: string): any | null {
        const item = this.cache.get(key);

        if (!item) {
            this.estadisticas.misses++;
            console.log(`❌ CacheService: Cache miss [${key}]`);
            return null;
        }

        // Verificar si ha expirado
        if (new Date() > item.expira) {
            this.cache.delete(key);
            this.estadisticas.misses++;
            console.log(`⏰ CacheService: Cache expirado [${key}]`);
            return null;
        }

        this.estadisticas.hits++;
        console.log(`✅ CacheService: Cache hit [${key}]`);
        return item.data;
    }

    /**
     * Verificar si una clave existe en caché y no ha expirado
     * @param key Clave del caché
     * @returns true si existe y es válido
     */
    has(key: string): boolean {
        const item = this.cache.get(key);
        if (!item) return false;
        if (new Date() > item.expira) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }

    /**
     * Eliminar una clave del caché
     * @param key Clave a eliminar
     */
    delete(key: string): boolean {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.estadisticas.deletes++;
            console.log(`🗑️  CacheService: Eliminado del caché [${key}]`);
        }
        return deleted;
    }

    /**
     * Limpiar todo el caché
     */
    clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`🗑️  CacheService: Caché limpiado (${size} items eliminados)`);
    }

    /**
     * Limpiar caché expirado
     */
    clearExpired(): number {
        let deleted = 0;
        const ahora = new Date();

        for (const [key, item] of this.cache.entries()) {
            if (ahora > item.expira) {
                this.cache.delete(key);
                deleted++;
            }
        }

        if (deleted > 0) {
            console.log(`🧹 CacheService: ${deleted} items expirados eliminados`);
        }

        return deleted;
    }

    /**
     * Obtener estadísticas del caché
     */
    getEstadisticas() {
        const totalRequests = this.estadisticas.hits + this.estadisticas.misses;
        const hitRate = totalRequests > 0
            ? ((this.estadisticas.hits / totalRequests) * 100).toFixed(2)
            : 0;

        return {
            items_en_cache: this.cache.size,
            hits: this.estadisticas.hits,
            misses: this.estadisticas.misses,
            sets: this.estadisticas.sets,
            deletes: this.estadisticas.deletes,
            total_requests: totalRequests,
            hit_rate: `${hitRate}%`,
            memoria_aproximada: `${(this.cache.size * 1024).toLocaleString()} bytes`
        };
    }

    /**
     * Obtener información de un item en caché
     */
    getInfo(key: string) {
        const item = this.cache.get(key);
        if (!item) return null;

        const ahora = new Date();
        const tiempoRestante = Math.max(0, Math.floor((item.expira.getTime() - ahora.getTime()) / 1000));

        return {
            key,
            creado: item.creado,
            expira: item.expira,
            tiempo_restante_segundos: tiempoRestante,
            expirado: tiempoRestante === 0
        };
    }

    /**
     * Listar todas las claves en caché
     */
    keys(): string[] {
        return Array.from(this.cache.keys());
    }

    /**
     * Obtener tamaño del caché
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Invalidar caché por patrón (ej: "reporte:*")
     */
    invalidatePattern(pattern: string): number {
        const regex = new RegExp(pattern.replace('*', '.*'));
        let deleted = 0;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                deleted++;
            }
        }

        if (deleted > 0) {
            console.log(`🗑️  CacheService: ${deleted} items eliminados por patrón [${pattern}]`);
        }

        return deleted;
    }

    /**
     * Resetear estadísticas
     */
    resetEstadisticas(): void {
        this.estadisticas = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
        console.log(`📊 CacheService: Estadísticas reseteadas`);
    }
}

export default new CacheService();

